import { cookies } from "next/headers";
import { CART_COOKIE, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { getProductById } from "@/lib/queries/products";
import type { Product } from "@/lib/data/types";

/**
 * Cart storage.
 *
 * An httpOnly cookie rather than localStorage: it survives a hard reload, is readable
 * on the server so the header badge and the cart page render correct on first paint
 * with no count flash, and it is shared across tabs. It is also the same shape a
 * `carts`/`cart_items` table would hold, so the Drizzle swap is a change of adapter,
 * not a change of model.
 */

export type CartLine = { productId: string; qty: number; variant?: string };
export type StoredCart = { items: CartLine[]; saved: CartLine[] };

export type HydratedLine = CartLine & {
  product: Product;
  unitPriceCents: number;
  lineTotalCents: number;
};

export type Cart = {
  lines: HydratedLine[];
  saved: HydratedLine[];
  count: number;
  subtotalCents: number;
  qualifiesFreeShipping: boolean;
  remainingForFreeShipping: number;
};

const EMPTY: StoredCart = { items: [], saved: [] };

export function parseCart(raw: string | undefined): StoredCart {
  if (!raw) return EMPTY;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredCart>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items.slice(0, 50) : [],
      saved: Array.isArray(parsed.saved) ? parsed.saved.slice(0, 50) : [],
    };
  } catch {
    // A corrupt cookie must never take down every page that reads the cart.
    return EMPTY;
  }
}

export async function readStoredCart(): Promise<StoredCart> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

function unitPrice(product: Product, variantId?: string): number {
  const variant = product.variants.find((v) => v.id === variantId);
  return product.priceCents + (variant?.priceDelta ?? 0);
}

function hydrate(lines: CartLine[]): HydratedLine[] {
  const out: HydratedLine[] = [];
  for (const line of lines) {
    const product = getProductById(line.productId);
    if (!product) continue; // Product pulled from the catalogue: drop it, do not crash.
    const price = unitPrice(product, line.variant);
    out.push({
      ...line,
      product,
      unitPriceCents: price,
      lineTotalCents: price * line.qty,
    });
  }
  return out;
}

export async function getCart(): Promise<Cart> {
  const stored = await readStoredCart();
  const lines = hydrate(stored.items);
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);

  return {
    lines,
    saved: hydrate(stored.saved),
    count: lines.reduce((sum, l) => sum + l.qty, 0),
    subtotalCents,
    qualifiesFreeShipping: subtotalCents >= FREE_SHIPPING_THRESHOLD,
    remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalCents),
  };
}

export async function getCartCount(): Promise<number> {
  const stored = await readStoredCart();
  return stored.items.reduce((sum, l) => sum + l.qty, 0);
}
