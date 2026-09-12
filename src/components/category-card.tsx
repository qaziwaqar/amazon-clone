import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import type { Product } from "@/lib/data/types";

/**
 * The 2x2 tile block that makes up most of Amazon's home page. Four products, four
 * labels, one link out. Everything in it is a real catalogue item, so the labels are
 * not decorative — they go somewhere.
 */
export function CategoryCard({
  title,
  items,
  href,
  cta = "Shop now",
}: {
  title: string;
  items: { product: Product; label: string }[];
  href: string;
  cta?: string;
}) {
  return (
    <section className="flex h-full flex-col bg-surface p-5">
      <h2 className="mb-3 text-xl font-bold leading-tight">{title}</h2>

      <div className="grid flex-1 grid-cols-2 gap-3">
        {items.slice(0, 4).map(({ product, label }) => (
          <Link key={product.id} href={`/dp/${product.slug}`} className="group block">
            <div className="relative aspect-square w-full overflow-hidden bg-surface-sunken">
              <ProductImage
                src={product.images[0]}
                alt={product.title}
                sizes="(max-width: 768px) 40vw, 160px"
                className="object-cover"
              />
            </div>
            <p className="mt-1 line-clamp-1 text-xs text-ink group-hover:underline">
              {label}
            </p>
          </Link>
        ))}
      </div>

      <Link href={href} className="mt-3 text-sm text-link hover:text-link-hover hover:underline">
        {cta}
      </Link>
    </section>
  );
}

/** Single-image variant, used where the real site drops to one large tile. */
export function FeatureCard({
  title,
  product,
  href,
  cta = "See more",
}: {
  title: string;
  product: Product;
  href: string;
  cta?: string;
}) {
  return (
    <section className="flex h-full flex-col bg-surface p-5">
      <h2 className="mb-3 text-xl font-bold leading-tight">{title}</h2>
      <Link href={`/dp/${product.slug}`} className="relative block flex-1 overflow-hidden bg-surface-sunken">
        <ProductImage
          src={product.images[0]}
          alt={product.title}
          sizes="(max-width: 768px) 90vw, 340px"
          className="object-cover"
        />
      </Link>
      <Link href={href} className="mt-3 text-sm text-link hover:text-link-hover hover:underline">
        {cta}
      </Link>
    </section>
  );
}
