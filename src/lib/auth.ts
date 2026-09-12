import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE } from "@/lib/constants";

export type User = { email: string; name: string };
type Record_ = User & { salt: string; hash: string };

/**
 * Session signing key.
 *
 * No hard-coded fallback: a default secret in source is the same as no secret at all.
 * If JWT_SECRET is unset the process generates a random one at boot, which keeps the
 * app working for anyone who clones and runs it, at the cost of sessions not surviving
 * a restart or spanning serverless instances. README says to set it in production.
 */
const SECRET =
  process.env.JWT_SECRET ||
  (() => {
    if (process.env.NODE_ENV === "production") {
      console.warn(
        "[auth] JWT_SECRET is not set. Using an ephemeral key — sessions will not " +
          "survive a restart. Set JWT_SECRET in the environment.",
      );
    }
    return randomBytes(32).toString("hex");
  })();

function hashPassword(password: string, salt = randomBytes(16).toString("hex")) {
  return { salt, hash: scryptSync(password, salt, 64).toString("hex") };
}

function verifyPassword(password: string, salt: string, expected: string): boolean {
  const actual = scryptSync(password, salt, 64);
  const expectedBuf = Buffer.from(expected, "hex");
  // Constant-time: a fast-failing comparison leaks how much of the hash matched.
  return (
    actual.length === expectedBuf.length && timingSafeEqual(actual, expectedBuf)
  );
}

export const DEMO_EMAIL = "demo@amazon-clone.dev";
export const DEMO_PASSWORD = "demo1234";

/**
 * Account store.
 *
 * Process memory, seeded with the demo account. Sign-up works and signs you straight
 * in, but accounts do not survive a restart because there is no database — stated in
 * the README rather than implied. Swapping this for a `users` table is the same
 * adapter change as the catalogue.
 */
const users = new Map<string, Record_>();
{
  const { salt, hash } = hashPassword(DEMO_PASSWORD);
  users.set(DEMO_EMAIL, { email: DEMO_EMAIL, name: "Demo Shopper", salt, hash });
}

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encode(user: User): string {
  const body = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function decode(token: string | undefined): User | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as User;
  } catch {
    return null;
  }
}

export async function getUser(): Promise<User | null> {
  const store = await cookies();
  return decode(store.get(SESSION_COOKIE)?.value);
}

export async function startSession(user: User) {
  const store = await cookies();
  store.set(SESSION_COOKIE, encode(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function endSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

export function authenticate(email: string, password: string): User | null {
  const record = users.get(email.toLowerCase().trim());
  if (!record) return null;
  if (!verifyPassword(password, record.salt, record.hash)) return null;
  return { email: record.email, name: record.name };
}

export function register(name: string, email: string, password: string): User {
  const key = email.toLowerCase().trim();
  const { salt, hash } = hashPassword(password);
  const user = { email: key, name: name.trim() || "Shopper" };
  users.set(key, { ...user, salt, hash });
  return user;
}

export function userExists(email: string): boolean {
  return users.has(email.toLowerCase().trim());
}
