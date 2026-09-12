import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCart } from "@/lib/cart";
import { getUser } from "@/lib/auth";
import { formatPrice } from "@/lib/utils";
import { TAX_RATE } from "@/lib/orders";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  // Middleware only checks that a session cookie exists; it runs on the edge without
  // the signing key. This is where a forged cookie actually gets rejected.
  const user = await getUser();
  if (!user) redirect("/signin?next=/checkout");

  const cart = await getCart();

  if (cart.lines.length === 0) {
    return (
      <main id="main" className="mx-auto w-full max-w-2xl px-4 py-16">
        <EmptyState
          title="There is nothing to check out"
          body="Your cart is empty, so there is no order to place yet."
          actionLabel="Continue shopping"
        />
      </main>
    );
  }

  const taxCents = Math.round(cart.subtotalCents * TAX_RATE);
  const totalCents = cart.subtotalCents + taxCents;

  const review = (
    <section className="rounded border border-line bg-surface p-5">
            <h2 className="mb-3 text-lg font-bold">
              <span className="mr-2 text-muted">4</span>Review items
            </h2>
            <ul className="space-y-4">
              {cart.lines.map((line) => (
                <li key={`${line.productId}-${line.variant ?? ""}`} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0">
                    <ProductImage
                      src={line.product.images[0]}
                      alt={line.product.title}
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">{line.product.title}</p>
                    <p className="text-xs text-muted">Qty: {line.qty}</p>
                    <p className="text-sm font-bold text-price">
                      {formatPrice(line.lineTotalCents)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
      <Link href="/cart" className="mt-4 inline-block text-sm text-link hover:underline">
        Edit cart
      </Link>
    </section>
  );

  const summary = (
    <>
      <hr className="my-4 border-line" />

      <h2 className="text-lg font-bold">Order Summary</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <Row label={`Items (${cart.count})`} value={formatPrice(cart.subtotalCents)} />
            <Row label="Shipping & handling" value="Selected at step 2" />
            <Row label="Estimated tax" value={formatPrice(taxCents)} />
          </dl>
          <hr className="my-3 border-line" />
          <p className="flex justify-between text-lg font-bold text-price">
            <span>Order total</span>
            <span>{formatPrice(totalCents)}</span>
          </p>
      <p className="mt-1 text-xs text-muted">
        Shipping is added to the total when you choose a speed. The server recomputes
        every figure at placement.
      </p>
    </>
  );

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-6">
      <CheckoutForm review={review} summary={summary} />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
