"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCart } from "@/lib/cart";
import { getUser } from "@/lib/auth";
import { clearCart } from "@/app/actions/cart";
import { appendOrder, SHIPPING, TAX_RATE } from "@/lib/orders";
import type { Order } from "@/lib/data/types";

export type CheckoutState = { error?: string };

/**
 * Order placement.
 *
 * Every line is re-read and re-priced from the catalogue inside this action. Nothing
 * about the total comes from the client — a posted price or quantity is ignored
 * entirely, which is the one rule a checkout cannot get wrong.
 */
export async function placeOrder(
  _prev: CheckoutState,
  form: FormData,
): Promise<CheckoutState> {
  // Server actions are reachable directly, so the route guard above them proves
  // nothing. An unauthenticated caller is refused here, at the only place that counts.
  const user = await getUser();
  if (!user) redirect("/signin?next=/checkout");

  const cart = await getCart();
  if (cart.lines.length === 0) return { error: "Your cart is empty." };

  const name = String(form.get("name") ?? "").trim();
  const address = String(form.get("address") ?? "").trim();
  const city = String(form.get("city") ?? "").trim();
  const zip = String(form.get("zip") ?? "").trim();
  const card = String(form.get("card") ?? "").replace(/\s+/g, "");
  const speed = (String(form.get("speed") ?? "standard") as Order["speed"]) ?? "standard";

  if (!name || !address || !city || !zip) {
    return { error: "Enter a complete delivery address." };
  }
  if (!luhn(card)) {
    return { error: "Enter a valid card number. Try 4242 4242 4242 4242." };
  }
  if (!(speed in SHIPPING)) return { error: "Choose a delivery speed." };

  // Stock is revalidated here, not at add-to-cart time. Between the two, someone else
  // may have taken the last one.
  const unavailable = cart.lines.find((l) => l.product.stock < l.qty);
  if (unavailable) {
    return {
      error: `${unavailable.product.title} is no longer available in that quantity. Adjust your cart and try again.`,
    };
  }

  const shippingCents = SHIPPING[speed].cents;
  const taxCents = Math.round(cart.subtotalCents * TAX_RATE);

  const orderId = await appendOrder({
    items: cart.lines.map((l) => ({
      p: l.productId,
      q: l.qty,
      v: l.variant,
      u: l.unitPriceCents,
    })),
    shippingCents,
    taxCents,
    shipTo: name,
    addressLine: `${address}, ${city} ${zip}`,
    speed,
  });

  await clearCart();
  revalidatePath("/", "layout");
  redirect(`/checkout/confirmation/${orderId}`);
}

/** Luhn check. Catches typos; proves nothing about a real card, and nothing is charged. */
function luhn(value: string): boolean {
  if (!/^\d{13,19}$/.test(value)) return false;
  let sum = 0;
  let double = false;
  for (let i = value.length - 1; i >= 0; i--) {
    let digit = Number(value[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}
