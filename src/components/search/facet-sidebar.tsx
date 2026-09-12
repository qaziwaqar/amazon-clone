import Link from "next/link";
import type { Facets, SearchParamsShape } from "@/lib/queries/products";
import { buildUrl, toggleBrand } from "@/lib/search-params";
import { StarRating } from "@/components/star-rating";
import { PrimeBadge } from "@/components/prime-badge";

/**
 * Facets are links, not JavaScript. State lives in the URL, so back/forward work, a
 * pasted link reproduces the view, and the filters function before hydration.
 */
export function FacetSidebar({
  facets,
  params,
}: {
  facets: Facets;
  params: SearchParamsShape;
}) {
  const active =
    params.i || params.brand?.length || params.rating || params.min != null || params.prime;

  return (
    <aside aria-label="Filters" className="w-full shrink-0 lg:w-56">
      {active ? (
        <Link
          href={buildUrl({ k: params.k }, {})}
          className="mb-4 inline-block text-sm text-link hover:text-link-hover hover:underline"
        >
          Clear all filters
        </Link>
      ) : null}

      <Group title="Department">
        {facets.departments.map((d) => (
          <Row
            key={d.slug}
            href={buildUrl(params, { i: params.i === d.slug ? undefined : d.slug })}
            selected={params.i === d.slug}
          >
            {d.name} <span className="text-muted">({d.count.toLocaleString()})</span>
          </Row>
        ))}
      </Group>

      <Group title="Customer Reviews">
        {facets.ratings.map((r) => (
          <Row
            key={r.min}
            href={buildUrl(params, { rating: params.rating === r.min ? undefined : r.min })}
            selected={params.rating === r.min}
          >
            <span className="flex items-center gap-1">
              <StarRating rating={r.min} />
              <span>&amp; Up</span>
              <span className="text-muted">({r.count.toLocaleString()})</span>
            </span>
          </Row>
        ))}
      </Group>

      <Group title="Price">
        {facets.priceBands.map((b) => {
          const selected = params.min === b.min && (params.max ?? null) === b.max;
          return (
            <Row
              key={b.label}
              href={buildUrl(params, {
                min: selected ? undefined : b.min,
                max: selected ? undefined : (b.max ?? undefined),
              })}
              selected={selected}
            >
              {b.label} <span className="text-muted">({b.count.toLocaleString()})</span>
            </Row>
          );
        })}
      </Group>

      <Group title="Brand">
        {facets.brands.map((b) => (
          <Row
            key={b.name}
            href={toggleBrand(params, b.name)}
            selected={params.brand?.includes(b.name) ?? false}
          >
            {b.name} <span className="text-muted">({b.count.toLocaleString()})</span>
          </Row>
        ))}
      </Group>

      <Group title="Delivery">
        <Row
          href={buildUrl(params, { prime: params.prime ? undefined : true })}
          selected={Boolean(params.prime)}
        >
          <span className="flex items-center gap-1">
            <PrimeBadge />
            <span className="text-muted">({facets.primeCount.toLocaleString()})</span>
          </span>
        </Row>
      </Group>
    </aside>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-1.5 text-base font-bold">{title}</h3>
      <ul className="space-y-1">{children}</ul>
    </section>
  );
}

function Row({
  href,
  selected,
  children,
}: {
  href: string;
  selected: boolean;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={selected ? "true" : undefined}
        className={`flex items-center gap-2 text-sm hover:text-link-hover hover:underline ${
          selected ? "font-bold text-ink" : "text-ink"
        }`}
      >
        <span
          aria-hidden
          className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-sm border ${
            selected ? "border-link bg-link text-white" : "border-muted"
          }`}
        >
          {selected ? "✓" : ""}
        </span>
        <span className="min-w-0 truncate">{children}</span>
      </Link>
    </li>
  );
}
