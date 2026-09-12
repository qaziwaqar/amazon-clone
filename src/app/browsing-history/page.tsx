import { readRecentlyViewed } from "@/lib/recently-viewed";
import { getBestSellers } from "@/lib/queries/products";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { EmptyState } from "@/components/ui/empty-state";
import { ClearHistoryButton } from "@/components/clear-history-button";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Browsing History" };

export default async function BrowsingHistoryPage() {
  const [viewed, dict] = await Promise.all([readRecentlyViewed(), getDict()]);

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded bg-surface p-5">
        <div>
          <h1 className="text-2xl font-bold">{dict.browsingHistory}</h1>
          <p className="mt-1 text-sm text-muted">
            {viewed.length > 0
              ? `The last ${viewed.length} ${viewed.length === 1 ? "product" : "products"} you opened, newest first.`
              : "Products you open are recorded here."}
          </p>
          <p className="mt-1 text-xs text-muted">
            Stored in a cookie on this device only. It is never sent anywhere else, and
            clearing it removes it completely.
          </p>
        </div>
        {viewed.length > 0 && <ClearHistoryButton label="Remove all items viewed" />}
      </div>

      {viewed.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="No browsing history yet"
            body="Open a product and it will appear here, so you can find your way back to it."
            actionLabel={dict.continueShopping}
          />
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {viewed.map((product) => (
            <ProductCard key={product.id} product={product} showCta />
          ))}
        </div>
      )}

      <div className="mt-4">
        <ProductRail title="Top sellers to get you started" products={getBestSellers(undefined, 16)} variant="card" />
      </div>
    </main>
  );
}
