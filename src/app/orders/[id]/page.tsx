import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOrder, orderProgress, SHIPPING } from "@/lib/orders";
import { Money } from "@/components/price";

export const metadata = { title: "Order details" };

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  if (!user) redirect(`/signin?next=/orders/${id}`);

  // Scoped to this user's orders. Someone else's id is simply not found — a 403 would
  // confirm the order exists, which is itself a leak.
  const order = await getOrder(id, user.email);
  if (!order) notFound();

  const { step, labels, eta } = orderProgress(order);

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-6">
      <Link href="/orders" className="text-sm text-link hover:underline">
        ‹ Back to Your Orders
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Order details</h1>
      <p className="text-sm text-muted">
        Ordered{" "}
        {new Date(order.placedAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}{" "}
        · Order # {order.id}
      </p>

      <section className="mt-4 rounded border border-line bg-surface p-5">
        <h2 className="text-lg font-bold">
          {step === 3 ? "Delivered" : `Arriving ${eta}`}
        </h2>

        <ol className="mt-4 flex gap-1">
          {labels.map((label, i) => (
            <li key={label} className="flex-1">
              <div
                className={`h-1.5 rounded-full ${i <= step ? "bg-success" : "bg-line"}`}
                aria-hidden
              />
              <p className={`mt-1 text-xs ${i <= step ? "font-bold text-ink" : "text-muted"}`}>
                {label}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded border border-line bg-surface p-5">
          <h2 className="text-lg font-bold">Items</h2>
          <ul className="mt-3 space-y-4">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-4">
                <Link href={`/dp/${item.slug}`} className="relative h-20 w-20 shrink-0">
                  <ProductImage src={item.image} alt={item.title} sizes="80px" className="object-contain" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/dp/${item.slug}`} className="line-clamp-2 text-sm text-link hover:underline">
                    {item.title}
                  </Link>
                  {item.variant && <p className="text-xs text-muted">Option: {item.variant}</p>}
                  <p className="text-xs text-muted">Qty {item.qty}</p>
                </div>
                <p className="shrink-0 text-sm font-bold text-price">
                  <Money cents={item.unitPriceCents * item.qty} />
                </p>
              </li>
            ))}
          </ul>
        </section>

        <aside className="h-fit space-y-4">
          <section className="rounded border border-line bg-surface p-5">
            <h2 className="text-base font-bold">Shipping address</h2>
            <p className="mt-1 text-sm">{order.shipTo}</p>
            <p className="text-sm text-muted">{order.addressLine}</p>
          </section>

          <section className="rounded border border-line bg-surface p-5">
            <h2 className="text-base font-bold">Payment</h2>
            <p className="mt-1 text-sm text-muted">{order.paymentLabel}</p>
            <p className="mt-1 text-xs text-muted">No charge was made.</p>
          </section>

          <section className="rounded border border-line bg-surface p-5">
            <h2 className="text-base font-bold">Order summary</h2>
            <dl className="mt-2 space-y-1 text-sm">
              <Row label="Item(s) subtotal" value={<Money cents={order.subtotalCents} />} />
              <Row label={SHIPPING[order.speed].label} value={<Money cents={order.shippingCents} />} />
              <Row label="Estimated tax" value={<Money cents={order.taxCents} />} />
            </dl>
            <hr className="my-2 border-line" />
            <p className="flex justify-between font-bold text-price">
              <span>Grand total</span>
              <span><Money cents={order.totalCents} /></span>
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
