"use client";

import { useTransition } from "react";
import { moveToCart, removeSaved } from "@/app/actions/cart";

export function SavedControls({
  productId,
  variant,
}: {
  productId: string;
  variant?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <div className="mt-2 flex items-center gap-3 text-sm">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await moveToCart(productId, variant)))}
        className="rounded-full border border-line bg-surface-sunken px-3 py-1 hover:bg-line/40 disabled:opacity-50"
      >
        Move to cart
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await removeSaved(productId, variant)))}
        className="text-link hover:text-link-hover hover:underline"
      >
        Delete
      </button>
    </div>
  );
}
