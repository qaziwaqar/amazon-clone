import type { SearchParamsShape, SortKey } from "@/lib/queries/products";

const SORTS: SortKey[] = ["featured", "price-asc", "price-desc", "rating", "newest"];

type Raw = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parse and clamp. Anything unparseable falls back to a default rather than throwing. */
export function parseSearchParams(raw: Raw): SearchParamsShape {
  const brand = raw.brand;
  const sort = one(raw.sort) as SortKey | undefined;
  const num = (v: string | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  return {
    k: one(raw.k)?.slice(0, 120) || undefined,
    i: one(raw.i) || undefined,
    brand: brand ? (Array.isArray(brand) ? brand : [brand]) : undefined,
    rating: num(one(raw.rating)),
    min: num(one(raw.min)),
    max: num(one(raw.max)),
    prime: one(raw.prime) === "1",
    sort: sort && SORTS.includes(sort) ? sort : "featured",
    page: Math.max(1, Number(one(raw.page)) || 1),
  };
}

/**
 * Build a URL with one facet toggled. Every filter lives in the URL, so a pasted link
 * reproduces the exact view — which is the whole point of doing facets this way.
 */
export function buildUrl(
  current: SearchParamsShape,
  patch: Partial<SearchParamsShape>,
): string {
  const next = { ...current, ...patch };
  const qs = new URLSearchParams();

  if (next.k) qs.set("k", next.k);
  if (next.i && next.i !== "all") qs.set("i", next.i);
  for (const b of next.brand ?? []) qs.append("brand", b);
  if (next.rating) qs.set("rating", String(next.rating));
  if (next.min != null) qs.set("min", String(next.min));
  if (next.max != null) qs.set("max", String(next.max));
  if (next.prime) qs.set("prime", "1");
  if (next.sort && next.sort !== "featured") qs.set("sort", next.sort);
  // Any filter change resets to page 1 unless the page is what changed.
  if (next.page && next.page > 1 && "page" in patch) qs.set("page", String(next.page));

  const s = qs.toString();
  return s ? `/s?${s}` : "/s";
}

export function toggleBrand(current: SearchParamsShape, brand: string): string {
  const set = new Set(current.brand ?? []);
  if (set.has(brand)) set.delete(brand);
  else set.add(brand);
  return buildUrl(current, { brand: [...set] });
}
