import Link from "next/link";
import { searchProducts } from "@/lib/queries/products";
import { parseSearchParams, buildUrl } from "@/lib/search-params";
import { departmentBySlug } from "@/lib/data/catalogue";
import { PAGE_SIZE } from "@/lib/constants";
import { FacetSidebar } from "@/components/search/facet-sidebar";
import { SortSelect } from "@/components/search/sort-select";
import { Pagination } from "@/components/search/pagination";
import { ProductCard } from "@/components/product-card";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  const params = parseSearchParams(await searchParams);
  const dept = params.i ? departmentBySlug(params.i) : undefined;
  const what = params.k ?? dept?.name ?? "All products";
  return { title: `Amazon.com: ${what}` };
}

export default async function SearchPage({ searchParams }: Props) {
  const params = parseSearchParams(await searchParams);
  const { items, total, page, pages, facets, corrected } = searchProducts(params);
  const dept = params.i ? departmentBySlug(params.i) : undefined;

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <main id="main" className="mx-auto w-full max-w-[1500px] px-4 py-4">
      <div className="flex flex-col gap-6 lg:flex-row">
        <FacetSidebar facets={facets} params={params} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <p className="text-sm text-muted">
              {total === 0 ? (
                "No results"
              ) : (
                <>
                  {from}-{to} of {total.toLocaleString()} results
                  {params.k ? (
                    <>
                      {" "}for <span className="font-bold text-price">&ldquo;{params.k}&rdquo;</span>
                    </>
                  ) : dept ? (
                    <> in <span className="font-bold text-ink">{dept.name}</span></>
                  ) : null}
                </>
              )}
            </p>
            <SortSelect params={params} />
          </div>

          {total === 0 ? (
            <ZeroResults query={params.k ?? ""} corrected={corrected} params={params} />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {items.map((product) => (
                  <ProductCard key={product.id} product={product} showCta />
                ))}
              </div>
              <Pagination params={params} page={page} pages={pages} />
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ZeroResults({
  query,
  corrected,
  params,
}: {
  query: string;
  corrected: string | null;
  params: ReturnType<typeof parseSearchParams>;
}) {
  return (
    <div className="rounded bg-surface px-6 py-12 text-center">
      <h1 className="text-xl font-bold">
        No results for &ldquo;{query}&rdquo;
      </h1>
      <p className="mt-2 text-sm text-muted">
        Try checking your spelling or use more general terms.
      </p>

      {corrected ? (
        <p className="mt-4 text-sm">
          Did you mean{" "}
          <Link
            href={buildUrl({ k: corrected }, {})}
            className="font-bold text-link hover:text-link-hover hover:underline"
          >
            {corrected}
          </Link>
          ?
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {["headphones", "laptop", "espresso", "running shoes", "board game"].map((term) => (
          <Link
            key={term}
            href={buildUrl({ k: term }, {})}
            className="rounded-full border border-line px-3 py-1 text-sm hover:bg-surface-sunken"
          >
            {term}
          </Link>
        ))}
      </div>

      {params.i || params.brand?.length || params.rating ? (
        <p className="mt-6 text-sm">
          <Link
            href={buildUrl({ k: params.k }, {})}
            className="text-link hover:text-link-hover hover:underline"
          >
            Clear filters and search all departments
          </Link>
        </p>
      ) : null}
    </div>
  );
}
