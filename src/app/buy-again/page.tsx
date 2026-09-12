import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getOrders } from "@/lib/orders";
import { getProductById } from "@/lib/queries/products";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDict } from "@/lib/i18n/server";
import type { Product } from "@/lib/data/types";

export const metadata = { title: "Buy Again" };

export default async function BuyAgainPage() {
  const user = await getUser();
  if (!user) redirect("/signin?next=/buy-again");

  const [orders, dict] = await Promise.all([getOrders(user.email), getDict()]);

  // De-duplicated across orders, most recently ordered first, and anything no longer
  // in the catalogue is dropped rather than rendered as a gap.
  const seen = new Set<string>();
  const items: { product: Product; lastOrdered: string; times: number }[] = [];
  const counts = new Map<string, number>();

  for (const order of orders) {
    for (const line of order.items) {
      counts.set(line.productId, (counts.get(line.productId) ?? 0) + line.qty);
    }
  }

  for (const order of orders) {
    for (const line of order.items) {
      if (seen.has(line.productId)) continue;
      const product = getProductById(line.productId);
      if (!product) continue;
      seen.add(line.productId);
      items.push({
        product,
        lastOrdered: order.placedAt,
        times: counts.get(line.productId) ?? 1,
      });
    }
  }

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <div className="rounded bg-surface p-5">
        <h1 className="text-2xl font-bold">{dict.buyAgain}</h1>
        <p className="mt-1 text-sm text-muted">
          Everything you have ordered before, most recent first.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Nothing to buy again yet"
            body="Once you place an order, its items show up here for one-click reordering."
            actionLabel={dict.continueShopping}
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {items.map(({ product, lastOrdered, times }) => (
            <div key={product.id} className="flex flex-col">
              <ProductCard product={product} showCta />
              <p className="mt-1 px-3 pb-3 text-xs text-muted">
                Ordered {times}×· last on{" "}
                {new Date(lastOrdered).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-4 text-sm">
        <Link href="/orders" className="text-link hover:text-link-hover hover:underline">
          {dict.yourOrders}
        </Link>
      </p>
    </main>
  );
}
