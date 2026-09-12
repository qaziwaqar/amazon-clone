import Link from "next/link";
import { notFound } from "next/navigation";
import {
  discountPercent,
  getProductBySlug,
  getRelated,
  getReviews,
} from "@/lib/queries/products";
import { departmentBySlug } from "@/lib/data/catalogue";
import { Money } from "@/components/price";
import { Gallery } from "@/components/pdp/gallery";
import { VariantSelector } from "@/components/pdp/variant-selector";
import { BuyBoxActions } from "@/components/pdp/buy-box";
import { Reviews } from "@/components/pdp/reviews";
import { TrackView } from "@/components/pdp/track-view";
import { ProductRail } from "@/components/product-rail";
import { StarRating } from "@/components/star-rating";
import { Price, ListPrice } from "@/components/price";
import { PrimeBadge } from "@/components/prime-badge";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  // Bail here, not just in the page: with a loading.tsx in place the response streams,
  // so the 200 shell is already flushed by the time the page component runs and a
  // notFound() there cannot set the status. Metadata resolves before the flush.
  if (!product) notFound();
  return {
    title: product.title,
    description: product.description,
    openGraph: { images: [product.images[0]], title: product.title },
  };
}

/** Delivery estimate from a fixed offset — deterministic, so it never contradicts itself. */
function deliveryDate(offsetDays: number): string {
  const d = new Date(Date.now() + offsetDays * 86400000);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { v } = await searchParams;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const dept = departmentBySlug(product.department);
  const reviews = getReviews(product);
  const related = getRelated(product);
  const off = discountPercent(product);

  const selected =
    product.variants.find((x) => x.id === v && x.available) ??
    product.variants.find((x) => x.available);
  const price = product.priceCents + (selected?.priceDelta ?? 0);

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <TrackView productId={product.id} />

      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted">
        <Link href="/" className="hover:text-link-hover hover:underline">Home</Link>
        {" › "}
        <Link href={`/s?i=${product.department}`} className="hover:text-link-hover hover:underline">
          {dept?.name}
        </Link>
        {" › "}
        <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid gap-6 bg-surface p-5 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)_300px]">
        <div className="relative">
          <Gallery images={product.images} title={product.title} />
        </div>

        <div className="min-w-0">
          <h1 className="text-2xl leading-tight">{product.title}</h1>
          <Link
            href={`/s?k=${encodeURIComponent(product.brand)}`}
            className="mt-1 inline-block text-sm text-link hover:text-link-hover hover:underline"
          >
            Visit the {product.brand} Store
          </Link>

          <a href="#reviews" className="mt-2 flex items-center gap-2 hover:underline">
            <StarRating rating={product.rating} size="md" />
            <span className="text-sm text-link">
              {product.reviewCount.toLocaleString()} ratings
            </span>
          </a>

          <hr className="my-4 border-line" />

          <div className="flex flex-wrap items-center gap-3">
            {off > 0 && <span className="text-2xl text-price">-{off}%</span>}
            <Price cents={price} size="lg" />
          </div>
          {off > 0 && <ListPrice cents={product.listPriceCents} />}

          {product.prime && (
            <p className="mt-1 flex items-center gap-1 text-sm">
              <PrimeBadge /> <span className="text-muted">FREE Returns</span>
            </p>
          )}

          <VariantSelector
            variants={product.variants}
            selected={selected?.id}
            basePrice={product.priceCents}
          />

          <h2 className="mt-6 text-base font-bold">About this item</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            {product.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <h2 className="mt-6 text-base font-bold">Specifications</h2>
          <table className="mt-2 w-full max-w-lg text-sm">
            <tbody>
              {Object.entries(product.specs).map(([k, val]) => (
                <tr key={k} className="border-b border-line last:border-0">
                  <th scope="row" className="w-40 bg-surface-sunken px-3 py-2 text-left font-bold">
                    {k}
                  </th>
                  <td className="px-3 py-2">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="h-fit rounded border border-line p-4 lg:sticky lg:top-32">
          <Price cents={price} size="md" />
          <p className="mt-2 text-sm">
            FREE delivery{" "}
            <span className="font-bold">{deliveryDate(product.prime ? 2 : 5)}</span>
          </p>
          <p className="mt-1 text-xs text-muted">
            Or fastest delivery {deliveryDate(1)}. Order within 4 hrs 12 mins.
          </p>

          <p className="mt-3 text-lg">
            {product.stock === 0 ? (
              <span className="text-danger">Currently unavailable</span>
            ) : product.stock < 12 ? (
              <span className="text-danger">Only {product.stock} left in stock</span>
            ) : (
              <span className="text-success">In Stock</span>
            )}
          </p>

          {product.stock > 0 && (
            <BuyBoxActions
              productId={product.id}
              variant={selected?.id}
              stock={product.stock}
            />
          )}

          <dl className="mt-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <dt className="text-muted">Ships from</dt>
              <dd>Amazon</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Sold by</dt>
              <dd>{product.brand}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Returns</dt>
              <dd>30-day refund</dd>
            </div>
          </dl>

          <p className="mt-3 text-xs text-muted">
            {product.soldCount.toLocaleString()}+ bought in the past month
          </p>
          <p className="mt-3 text-xs text-muted">
            Prices are <Money cents={price} /> for the selected option. No real payment is
            processed anywhere on this site.
          </p>
        </aside>
      </div>

      <div className="mt-4">
        <ProductRail
          title="Customers who viewed this item also viewed"
          products={related}
          variant="card"
          href={`/s?i=${product.department}`}
        />
      </div>

      <div className="mt-4">
        <Reviews product={product} reviews={reviews} />
      </div>
    </main>
  );
}
