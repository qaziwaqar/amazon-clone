"use client";

import { useOptimistic, useTransition } from "react";
import { removeItem, saveForLater, updateQty } from "@/app/actions/cart";

/**
 * Optimistic quantity. The server is still the authority — it clamps against stock —
 * so the optimistic value is a prediction that gets replaced by the revalidated
 * render, not a second source of truth.
 */
export function LineControls({
  productId,
  variant,
  qty,
  stock,
}: {
  productId: string;
  variant?: string;
  qty: number;
  stock: number;
}) {
  const [pending, start] = useTransition();
  const [optimisticQty, setOptimisticQty] = useOptimistic(qty);

  const change = (next: number) =>
    start(async () => {
      setOptimisticQty(next);
      await updateQty(productId, next, variant);
    });

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
      <div className="flex items-center rounded-full border border-line bg-surface-sunken">
        <button
          type="button"
          onClick={() => change(optimisticQty - 1)}
          disabled={pending}
          aria-label={optimisticQty === 1 ? "Remove item" : "Decrease quantity"}
          className="px-3 py-1 disabled:opacity-50"
        >
          {optimisticQty === 1 ? "Remove" : "−"}
        </button>
        <span aria-live="polite" className="min-w-8 px-2 text-center font-bold">
          {optimisticQty}
        </span>
        <button
          type="button"
          onClick={() => change(optimisticQty + 1)}
          disabled={pending || optimisticQty >= stock}
          aria-label="Increase quantity"
          className="px-3 py-1 disabled:opacity-50"
        >
          +
        </button>
      </div>

      <span className="text-line" aria-hidden>|</span>

      <button
        type="button"
        onClick={() => start(async () => void (await removeItem(productId, variant)))}
        className="text-link hover:text-link-hover hover:underline"
      >
        Delete
      </button>

      <span className="text-line" aria-hidden>|</span>

      <button
        type="button"
        onClick={() => start(async () => void (await saveForLater(productId, variant)))}
        className="text-link hover:text-link-hover hover:underline"
      >
        Save for later
      </button>
    </div>
  );
}
