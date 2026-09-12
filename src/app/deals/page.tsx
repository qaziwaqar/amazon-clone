import { getDeals, discountPercent } from "@/lib/queries/products";
import { ProductCard } from "@/components/product-card";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Today's Deals" };

export default async function DealsPage() {
  const dict = await getDict();
  const deals = getDeals(48);
  const biggest = deals.filter((p) => discountPercent(p) >= 30);

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <div className="rounded bg-surface p-5">
        <h1 className="text-2xl font-bold">{dict.todaysDeals}</h1>
        <p className="mt-1 text-sm text-muted">
          Every item below is genuinely discounted against its list price —{" "}
          {biggest.length} of them by 30% or more. Ranked by discount, deepest first.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {deals.map((product) => (
          <ProductCard key={product.id} product={product} showCta />
        ))}
      </div>
    </main>
  );
}
