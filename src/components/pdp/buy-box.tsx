"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";

export function BuyBoxActions({
  productId,
  variant,
  stock,
}: {
  productId: string;
  variant?: string;
  stock: number;
}) {
  const [qty, setQty] = useState(1);
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const act = (then: "stay" | "checkout") =>
    start(async () => {
      await addToCart(productId, qty, variant);
      if (then === "checkout") router.push("/checkout");
      else {
        setAdded(true);
        setTimeout(() => setAdded(false), 1800);
      }
    });

  const max = Math.min(stock, 10);

  return (
    <div className="mt-4 space-y-2">
      <label className="flex items-center gap-2 text-sm">
        <span>Quantity:</span>
        <select
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          className="rounded border border-line bg-surface-sunken px-2 py-1"
        >
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        disabled={pending}
        onClick={() => act("stay")}
        className="w-full rounded-full border border-cta-border bg-cta py-2 text-sm hover:bg-cta-hover disabled:opacity-60"
      >
        {pending ? "Adding…" : added ? "Added to cart ✓" : "Add to Cart"}
      </button>

      <button
        type="button"
        disabled={pending}
        onClick={() => act("checkout")}
        className="w-full rounded-full border border-buy-border bg-buy py-2 text-sm hover:bg-buy-hover disabled:opacity-60"
      >
        Buy Now
      </button>
    </div>
  );
}
