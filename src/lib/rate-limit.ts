import { headers } from "next/headers";

/**
 * Best-effort rate limiting for unauthenticated, expensive endpoints.
 *
 * Sign-in runs scrypt, which is deliberately slow. That is right for password storage
 * and wrong as something an anonymous caller can trigger in a loop: each attempt burns
 * CPU we are billed for, and on a serverless host CPU time is the bill. This puts a
 * ceiling on how fast that can be driven.
 *
 * Honest about its limits: the counters live in process memory, so each serverless
 * instance keeps its own and a distributed attacker sees a higher effective limit. It
 * raises the cost of an attack rather than making one impossible. A deployment that
 * needed a real guarantee would move the counters to a shared store — Vercel KV,
 * Upstash, or the database once there is one — and the interface here would not change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

export async function clientKey(prefix: string): Promise<string> {
  const h = await headers();
  // x-forwarded-for is set by the platform proxy. It is client-controllable in general,
  // which is another reason this is a cost control and not an access control.
  const ip =
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  return `${prefix}:${ip}`;
}

export function check(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    // Cheap eviction: the map must not become its own memory-exhaustion vector.
    if (buckets.size > MAX_BUCKETS) {
      for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
      if (buckets.size > MAX_BUCKETS) buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Ten attempts per IP per five minutes. Generous for a person, hostile to a loop. */
export async function limitAuthAttempt(): Promise<RateLimitResult> {
  return check(await clientKey("auth"), 10, 5 * 60 * 1000);
}
