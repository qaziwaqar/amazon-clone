"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { addToCart } from "@/app/actions/cart";

export function BuyAgainButton({ productId }: { productId: string }) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await addToCart(productId, 1);
          router.push("/cart");
        })
      }
      className="w-full rounded-full border border-cta-border bg-cta py-1 text-xs hover:bg-cta-hover disabled:opacity-60"
    >
      {pending ? "Adding…" : "Buy it again"}
    </button>
  );
}
