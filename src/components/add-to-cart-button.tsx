"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addToCart } from "@/app/actions/cart";

export function AddToCartButton({
  productId,
  variant,
  qty = 1,
  compact = false,
  buyNow = false,
  label,
}: {
  productId: string;
  variant?: string;
  qty?: number;
  compact?: boolean;
  buyNow?: boolean;
  label?: string;
}) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const base = buyNow
    ? "border-buy-border bg-buy hover:bg-buy-hover"
    : "border-cta-border bg-cta hover:bg-cta-hover";

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await addToCart(productId, qty, variant);
          if (buyNow) router.push("/checkout");
          else {
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }
        })
      }
      className={`w-full rounded-full border px-3 text-ink disabled:opacity-60 ${base} ${
        compact ? "py-1 text-xs" : "py-1.5 text-sm"
      }`}
    >
      {pending ? "Adding…" : added ? "Added ✓" : (label ?? (buyNow ? "Buy Now" : "Add to cart"))}
    </button>
  );
}
