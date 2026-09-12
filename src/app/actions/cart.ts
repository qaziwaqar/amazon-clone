"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { CART_COOKIE } from "@/lib/constants";
import { parseCart, type CartLine, type StoredCart } from "@/lib/cart";
import { getProductById } from "@/lib/queries/products";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

async function write(cart: StoredCart) {
  const store = await cookies();
  store.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: THIRTY_DAYS,
  });
  // Header badge, cart page and checkout all read the cart, so revalidate broadly.
  revalidatePath("/", "layout");
}

async function read(): Promise<StoredCart> {
  const store = await cookies();
  return parseCart(store.get(CART_COOKIE)?.value);
}

const sameLine = (a: CartLine, productId: string, variant?: string) =>
  a.productId === productId && (a.variant ?? null) === (variant ?? null);

export async function addToCart(productId: string, qty = 1, variant?: string) {
  const product = getProductById(productId);
  if (!product || product.stock === 0) return { ok: false, error: "Item unavailable" };

  const cart = await read();
  const existing = cart.items.find((l) => sameLine(l, productId, variant));

  // Quantity is clamped against stock on the server. The client never decides this.
  if (existing) existing.qty = Math.min(product.stock, existing.qty + qty);
  else cart.items.unshift({ productId, qty: Math.min(product.stock, qty), variant });

  await write(cart);
  return { ok: true };
}

export async function updateQty(productId: string, qty: number, variant?: string) {
  const cart = await read();
  const product = getProductById(productId);
  if (!product) return { ok: false, error: "Item unavailable" };

  if (qty <= 0) {
    cart.items = cart.items.filter((l) => !sameLine(l, productId, variant));
  } else {
    const line = cart.items.find((l) => sameLine(l, productId, variant));
    if (line) line.qty = Math.min(product.stock, qty);
  }

  await write(cart);
  return { ok: true };
}

export async function removeItem(productId: string, variant?: string) {
  const cart = await read();
  cart.items = cart.items.filter((l) => !sameLine(l, productId, variant));
  await write(cart);
  return { ok: true };
}

export async function saveForLater(productId: string, variant?: string) {
  const cart = await read();
  const line = cart.items.find((l) => sameLine(l, productId, variant));
  if (!line) return { ok: false };
  cart.items = cart.items.filter((l) => !sameLine(l, productId, variant));
  cart.saved.unshift(line);
  await write(cart);
  return { ok: true };
}

export async function moveToCart(productId: string, variant?: string) {
  const cart = await read();
  const line = cart.saved.find((l) => sameLine(l, productId, variant));
  if (!line) return { ok: false };
  cart.saved = cart.saved.filter((l) => !sameLine(l, productId, variant));
  cart.items.unshift(line);
  await write(cart);
  return { ok: true };
}

export async function removeSaved(productId: string, variant?: string) {
  const cart = await read();
  cart.saved = cart.saved.filter((l) => !sameLine(l, productId, variant));
  await write(cart);
  return { ok: true };
}

export async function clearCart() {
  await write({ items: [], saved: [] });
}
