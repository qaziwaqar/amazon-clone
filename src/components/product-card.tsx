import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data/types";
import { discountPercent } from "@/lib/queries/products";
import { StarRating } from "./star-rating";
import { Price, ListPrice } from "./price";
import { PrimeBadge } from "./prime-badge";
import { AddToCartButton } from "./add-to-cart-button";

export function ProductCard({
  product,
  compact = false,
  showCta = false,
}: {
  product: Product;
  compact?: boolean;
  showCta?: boolean;
}) {
  const off = discountPercent(product);

  return (
    <article className="flex h-full flex-col rounded bg-surface p-3">
      <Link href={`/dp/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
            className="object-contain transition-transform duration-200 hover:scale-105"
          />
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col">
        <Link
          href={`/dp/${product.slug}`}
          className="line-clamp-2 text-sm text-ink hover:text-link-hover hover:underline"
        >
          {product.title}
        </Link>

        {!compact && (
          <Link
            href={`/dp/${product.slug}#reviews`}
            className="mt-1 flex items-center gap-1 hover:underline"
          >
            <StarRating rating={product.rating} />
            <span className="text-xs text-link">
              {product.reviewCount.toLocaleString()}
            </span>
          </Link>
        )}

        <div className="mt-1 flex flex-wrap items-baseline gap-2">
          {off > 0 && (
            <span className="rounded bg-danger px-1.5 py-0.5 text-xs font-bold text-white">
              -{off}%
            </span>
          )}
          <Price cents={product.priceCents} />
        </div>

        {off > 0 && <ListPrice cents={product.listPriceCents} />}

        {product.prime && (
          <div className="mt-1 flex items-center gap-1">
            <PrimeBadge />
            <span className="text-xs text-muted">FREE delivery</span>
          </div>
        )}

        {product.stock === 0 ? (
          <p className="mt-1 text-xs text-danger">Currently unavailable</p>
        ) : product.stock < 12 ? (
          <p className="mt-1 text-xs text-danger">
            Only {product.stock} left in stock
          </p>
        ) : null}

        {showCta && product.stock > 0 && (
          <div className="mt-auto pt-3">
            <AddToCartButton productId={product.id} compact />
          </div>
        )}
      </div>
    </article>
  );
}
