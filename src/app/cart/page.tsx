import Image from "next/image";
import Link from "next/link";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { getBestSellers } from "@/lib/queries/products";
import { LineControls } from "@/components/cart/line-controls";
import { SavedControls } from "@/components/cart/saved-controls";
import { Price } from "@/components/price";
import { ProductRail } from "@/components/product-rail";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Shopping Cart" };

export default async function CartPage() {
  const cart = await getCart();

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      {cart.lines.length === 0 ? (
        <EmptyState
          title="Your Amazon Cart is empty"
          body="Your shopping cart lives to serve. Give it purpose — fill it with books, electronics, videos, etc. and make it happy."
          actionLabel="Continue shopping"
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="bg-surface p-5">
            <h1 className="text-2xl">Shopping Cart</h1>
            <p className="mt-1 border-b border-line pb-3 text-right text-sm text-muted">
              Price
            </p>

            <ul>
              {cart.lines.map((line) => (
                <li
                  key={`${line.productId}-${line.variant ?? ""}`}
                  className="flex gap-4 border-b border-line py-4"
                >
                  <Link
                    href={`/dp/${line.product.slug}`}
                    className="relative h-28 w-28 shrink-0 sm:h-36 sm:w-36"
                  >
                    <Image
                      src={line.product.images[0]}
                      alt={line.product.title}
                      fill
                      sizes="144px"
                      className="object-contain"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-4">
                      <Link
                        href={`/dp/${line.product.slug}`}
                        className="text-base hover:text-link-hover hover:underline sm:text-lg"
                      >
                        {line.product.title}
                      </Link>
                      <Price cents={line.lineTotalCents} className="shrink-0" />
                    </div>

                    <p className="mt-1 text-xs text-success">
                      {line.product.stock > 0 ? "In Stock" : "Currently unavailable"}
                    </p>
                    {line.variant && (
                      <p className="text-xs text-muted">
                        Option:{" "}
                        {line.product.variants.find((v) => v.id === line.variant)?.label}
                      </p>
                    )}
                    <p className="text-xs text-muted">
                      Sold by {line.product.brand} · Gift options not available
                    </p>

                    <LineControls
                      productId={line.productId}
                      variant={line.variant}
                      qty={line.qty}
                      stock={line.product.stock}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <p className="pt-4 text-right text-lg">
              Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"}):{" "}
              <span className="font-bold">{formatPrice(cart.subtotalCents)}</span>
            </p>
          </section>

          <aside className="h-fit bg-surface p-5 lg:sticky lg:top-32">
            {cart.qualifiesFreeShipping ? (
              <p className="text-sm text-success">
                Your order qualifies for FREE Shipping.
              </p>
            ) : (
              <>
                <p className="text-sm">
                  Add{" "}
                  <span className="font-bold">
                    {formatPrice(cart.remainingForFreeShipping)}
                  </span>{" "}
                  of eligible items to your order to qualify for FREE Shipping.
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-alt">
                  <div
                    className="h-full bg-success"
                    style={{
                      width: `${Math.min(100, (cart.subtotalCents / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                    }}
                    aria-hidden
                  />
                </div>
              </>
            )}

            <p className="mt-4 text-lg">
              Subtotal ({cart.count} {cart.count === 1 ? "item" : "items"}):{" "}
              <span className="font-bold">{formatPrice(cart.subtotalCents)}</span>
            </p>

            <Link
              href="/checkout"
              className="mt-4 block rounded-full border border-cta-border bg-cta py-2 text-center text-sm hover:bg-cta-hover"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}

      {cart.saved.length > 0 && (
        <section className="mt-4 bg-surface p-5">
          <h2 className="text-xl font-bold">Saved for later ({cart.saved.length})</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cart.saved.map((line) => (
              <li key={`${line.productId}-${line.variant ?? ""}`}>
                <Link href={`/dp/${line.product.slug}`} className="relative block aspect-square">
                  <Image
                    src={line.product.images[0]}
                    alt={line.product.title}
                    fill
                    sizes="200px"
                    className="object-contain"
                  />
                </Link>
                <Link
                  href={`/dp/${line.product.slug}`}
                  className="mt-2 line-clamp-2 block text-sm hover:text-link-hover hover:underline"
                >
                  {line.product.title}
                </Link>
                <Price cents={line.unitPriceCents} size="sm" className="mt-1" />
                <SavedControls productId={line.productId} variant={line.variant} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-4">
        <ProductRail
          title="Customers who bought items in your cart also bought"
          products={getBestSellers(undefined, 16)}
          variant="card"
        />
      </div>
    </main>
  );
}
