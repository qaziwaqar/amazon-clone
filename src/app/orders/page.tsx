import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOrders, orderProgress } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { BuyAgainButton } from "@/components/orders/buy-again";

export const metadata = { title: "Your Orders" };

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/signin?next=/orders");

  const orders = await getOrders(user.email);

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-6">
      <h1 className="text-2xl font-bold">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="You have no orders yet"
            body="Once you place an order it will show up here, with delivery progress and a buy-again shortcut."
            actionLabel="Start shopping"
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {orders.map((order) => {
            const { step, labels } = orderProgress(order);
            return (
              <li key={order.id} className="rounded border border-line bg-surface">
                <div className="flex flex-wrap gap-6 rounded-t border-b border-line bg-surface-sunken px-5 py-3 text-xs">
                  <div>
                    <dt className="text-muted">ORDER PLACED</dt>
                    <dd>{new Date(order.placedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">TOTAL</dt>
                    <dd>{formatPrice(order.totalCents)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">SHIP TO</dt>
                    <dd>{order.shipTo}</dd>
                  </div>
                  <div className="ml-auto text-right">
                    <dt className="text-muted">ORDER # {order.id}</dt>
                    <dd>
                      <Link href={`/orders/${order.id}`} className="text-link hover:underline">
                        View order details
                      </Link>
                    </dd>
                  </div>
                </div>

                <div className="px-5 py-4">
                  <p className="text-lg font-bold">
                    {step === 3 ? "Delivered" : labels[step]}
                  </p>
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
                          <p className="text-xs text-muted">
                            Qty {item.qty} · {formatPrice(item.unitPriceCents)} each
                          </p>
                          <div className="mt-2 w-40">
                            <BuyAgainButton productId={item.productId} />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
