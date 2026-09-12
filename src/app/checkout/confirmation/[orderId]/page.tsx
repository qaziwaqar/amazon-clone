import { ProductImage } from "@/components/product-image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOrder, orderProgress } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Order placed" };

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await getUser();
  if (!user) redirect(`/signin?next=/checkout/confirmation/${orderId}`);

  const order = await getOrder(orderId, user.email);
  if (!order) notFound();

  const { eta } = orderProgress(order);

  return (
    <main id="main" className="mx-auto w-full max-w-[1100px] px-4 py-10">
      <div className="rounded border border-line bg-surface p-6">
        <h1 className="text-2xl font-bold text-success">Order placed, thank you!</h1>
        <p className="mt-2 text-sm">
          Confirmation will be sent to your email — in this rebuild, nowhere at all.
        </p>
        <p className="mt-4 text-sm">
          Order <span className="font-bold">#{order.id}</span>
        </p>
        <p className="text-sm">
          Arriving <span className="font-bold">{eta}</span> to {order.shipTo},{" "}
          {order.addressLine}
        </p>
        <p className="mt-1 text-lg font-bold text-price">
          Order total: {formatPrice(order.totalCents)}
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.variant ?? ""}`} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0">
                <ProductImage src={item.image} alt={item.title} sizes="64px" className="object-contain" />
              </div>
              <div className="min-w-0">
                <Link href={`/dp/${item.slug}`} className="line-clamp-2 text-sm hover:underline">
                  {item.title}
                </Link>
                <p className="text-xs text-muted">Qty {item.qty}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/orders"
            className="rounded-full border border-cta-border bg-cta px-5 py-2 text-sm hover:bg-cta-hover"
          >
            View your orders
          </Link>
          <Link
            href="/"
            className="rounded-full border border-line px-5 py-2 text-sm hover:bg-surface-sunken"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
