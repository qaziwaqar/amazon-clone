import { allProducts } from "@/lib/data/catalogue";
import { ProductCard } from "@/components/product-card";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Gift Cards" };

export default async function GiftCardsPage() {
  const dict = await getDict();
  const cards = allProducts()
    .filter((p) => p.department === "gift-cards")
    .sort((a, b) => a.priceCents - b.priceCents);

  const designs = [...new Set(cards.map((c) => c.specs.Design))];

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <div className="rounded bg-surface p-5">
        <h1 className="text-2xl font-bold">{dict.giftCards}</h1>
        <p className="mt-1 text-sm text-muted">
          Fixed denominations, no fees, no expiry. These are ordinary catalogue items:
          they add to the cart and check out through the same path as anything else.
        </p>
        <p className="mt-2 text-sm text-muted">
          No card is actually issued in this rebuild, and nothing is emailed.
        </p>
      </div>

      {designs.map((design) => (
        <section key={design} className="mt-4 bg-surface p-5">
          <h2 className="mb-3 text-xl font-bold">{design}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {cards
              .filter((c) => c.specs.Design === design)
              .map((product) => (
                <ProductCard key={product.id} product={product} showCta compact />
              ))}
          </div>
        </section>
      ))}
    </main>
  );
}
