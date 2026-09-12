import Link from "next/link";
import { allProducts } from "@/lib/data/catalogue";
import { discountPercent } from "@/lib/queries/products";
import { DEPARTMENTS } from "@/lib/departments";
import { ProductCard } from "@/components/product-card";
import { getDict } from "@/lib/i18n/server";

export const metadata = { title: "Coupons" };

/**
 * Coupons are grouped by department rather than shown as one long grid — the real page
 * is a browse surface, not a search result. A department with nothing discounted is
 * omitted instead of rendering an empty shelf.
 */
export default async function CouponsPage() {
  const dict = await getDict();

  const groups = DEPARTMENTS.map((dept) => ({
    dept,
    items: allProducts()
      .filter((p) => p.department === dept.slug && discountPercent(p) >= 20 && p.stock > 0)
      .sort((a, b) => discountPercent(b) - discountPercent(a))
      .slice(0, 5),
  })).filter((g) => g.items.length > 0);

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <div className="rounded bg-surface p-5">
        <h1 className="text-2xl font-bold">{dict.coupons}</h1>
        <p className="mt-1 text-sm text-muted">
          Savings of 20% or more, by department. The discount is already applied to the
          price shown — there is no code to enter and nothing to clip.
        </p>
      </div>

      <div className="mt-4 space-y-4">
        {groups.map(({ dept, items }) => (
          <section key={dept.slug} className="bg-surface p-5">
            <div className="mb-3 flex items-baseline gap-3">
              <h2 className="text-xl font-bold">{dept.name}</h2>
              <Link
                href={`/s?i=${dept.slug}`}
                className="text-sm text-link hover:text-link-hover hover:underline"
              >
                {dict.seeMore}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} showCta />
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
