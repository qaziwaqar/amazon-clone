"use client";

import { ProductImage } from "@/components/product-image";
import { useRef } from "react";
import Link from "next/link";
import type { Product } from "@/lib/data/types";
import { ChevronIcon } from "./icons";
import { ProductCard } from "./product-card";

/**
 * Horizontal rail. Scrolls natively — the arrow buttons nudge the same scroll
 * container rather than driving a separate transform, so touch, trackpad and keyboard
 * all stay in sync with the controls.
 */
export function ProductRail({
  title,
  products,
  href,
  variant = "image",
}: {
  title: string;
  products: Product[];
  href?: string;
  variant?: "image" | "card";
}) {
  const ref = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-surface p-5">
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {href && (
          <Link href={href} className="text-sm text-link hover:text-link-hover hover:underline">
            See more
          </Link>
        )}
      </div>

      <div className="relative">
        <div ref={ref} className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth">
          {products.map((product) =>
            variant === "card" ? (
              <div key={product.id} className="w-[200px] shrink-0">
                <ProductCard product={product} />
              </div>
            ) : (
              <Link
                key={product.id}
                href={`/dp/${product.slug}`}
                className="w-[140px] shrink-0 sm:w-[160px]"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-surface-sunken">
                  <ProductImage
                    src={product.images[0]}
                    alt={product.title}
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
              </Link>
            ),
          )}
        </div>

        <button
          type="button"
          onClick={() => nudge(-1)}
          aria-label={`Scroll ${title} left`}
          className="absolute -left-2 top-1/2 hidden h-16 w-8 -translate-y-1/2 place-items-center border border-line bg-surface/90 text-ink hover:bg-surface-sunken sm:grid"
        >
          <ChevronIcon className="h-5 w-5 rotate-180" />
        </button>
        <button
          type="button"
          onClick={() => nudge(1)}
          aria-label={`Scroll ${title} right`}
          className="absolute -right-2 top-1/2 hidden h-16 w-8 -translate-y-1/2 place-items-center border border-line bg-surface/90 text-ink hover:bg-surface-sunken sm:grid"
        >
          <ChevronIcon className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
