"use client";

import { useState } from "react";

/**
 * Sits in the sticky summary panel, outside the form element, and submits it by id.
 *
 * Double-submit is stopped twice over: this disables on first click, and the action
 * itself empties the cart before redirecting, so a second submission that slips
 * through finds an empty cart and refuses rather than placing a duplicate order.
 */
export function PlaceOrderButton() {
  const [clicked, setClicked] = useState(false);

  return (
    <button
      type="submit"
      form="checkout-form"
      disabled={clicked}
      onClick={() => setClicked(true)}
      className="w-full rounded-full border border-cta-border bg-cta py-2 text-sm hover:bg-cta-hover disabled:opacity-60"
    >
      {clicked ? "Placing order…" : "Place your order"}
    </button>
  );
}
