import { cookies } from "next/headers";
import { RECENTLY_VIEWED_MAX } from "@/lib/constants";
import { getProductById } from "@/lib/queries/products";
import type { Product } from "@/lib/data/types";

const COOKIE = "recently_viewed";

export async function readRecentlyViewed(): Promise<Product[]> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return [];
  try {
    const ids = JSON.parse(raw) as string[];
    return ids
      .slice(0, RECENTLY_VIEWED_MAX)
      .map((id) => getProductById(id))
      .filter((p): p is Product => Boolean(p));
  } catch {
    return [];
  }
}

export async function pushRecentlyViewed(productId: string) {
  const store = await cookies();
  const existing = await readRecentlyViewed();
  const ids = [productId, ...existing.map((p) => p.id).filter((id) => id !== productId)].slice(
    0,
    RECENTLY_VIEWED_MAX,
  );
  store.set(COOKIE, JSON.stringify(ids), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export { COOKIE as RECENTLY_VIEWED_COOKIE };
