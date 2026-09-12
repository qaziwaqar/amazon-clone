import { allProducts, DEPARTMENTS, reviewsFor } from "@/lib/data/catalogue";
import type { Product, Review } from "@/lib/data/types";
import { PAGE_SIZE } from "@/lib/constants";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

export type SearchParamsShape = {
  k?: string;
  i?: string;
  brand?: string[];
  rating?: number;
  min?: number;
  max?: number;
  prime?: boolean;
  sort?: SortKey;
  page?: number;
};

export type Facets = {
  departments: { slug: string; name: string; count: number }[];
  brands: { name: string; count: number }[];
  ratings: { min: number; count: number }[];
  priceBands: { label: string; min: number; max: number | null; count: number }[];
  primeCount: number;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, " ");

function bigrams(s: string): Set<string> {
  const out = new Set<string>();
  const t = ` ${s} `;
  for (let i = 0; i < t.length - 1; i++) out.add(t.slice(i, i + 2));
  return out;
}

/** Dice coefficient. Cheap, and good enough to catch "wirless" -> "wireless". */
function similarity(a: string, b: string): number {
  const A = bigrams(a);
  const B = bigrams(b);
  let shared = 0;
  for (const g of A) if (B.has(g)) shared++;
  return (2 * shared) / (A.size + B.size);
}

/**
 * Relevance score. Title beats brand beats description, which is the same weighting a
 * Postgres tsvector would get (A/B/C) — so swapping this for SQL later does not change
 * result ordering in a way a user would notice.
 */
function score(product: Product, terms: string[]): number {
  if (terms.length === 0) return 0;
  const title = norm(product.title);
  const brand = norm(product.brand);
  const body = norm(`${product.description} ${Object.values(product.specs).join(" ")}`);

  let total = 0;
  for (const term of terms) {
    if (title.includes(term)) total += 10;
    else if (brand.includes(term)) total += 6;
    else if (body.includes(term)) total += 2;
    else {
      // Typo tolerance: best-matching word in the title, if it is close enough.
      const best = Math.max(...title.split(" ").map((w) => (w ? similarity(w, term) : 0)));
      if (best > 0.62) total += 6 * best;
    }
  }

  // Tie-break with popularity so equally-relevant results are not arbitrarily ordered.
  return total > 0 ? total + Math.min(2, product.soldCount / 5000) : 0;
}

function matchesFilters(p: Product, params: SearchParamsShape): boolean {
  if (params.i && params.i !== "all" && p.department !== params.i) return false;
  if (params.brand?.length && !params.brand.includes(p.brand)) return false;
  if (params.rating && p.rating < params.rating) return false;
  if (params.min != null && p.priceCents < params.min) return false;
  if (params.max != null && p.priceCents > params.max) return false;
  if (params.prime && !p.prime) return false;
  return true;
}

function sortProducts(list: Product[], sort: SortKey, scores: Map<string, number>): Product[] {
  const out = [...list];
  switch (sort) {
    case "price-asc":
      return out.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return out.sort((a, b) => b.priceCents - a.priceCents);
    case "rating":
      return out.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case "newest":
      return out.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
    default:
      return out.sort(
        (a, b) =>
          (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0) ||
          b.soldCount - a.soldCount,
      );
  }
}

const PRICE_BANDS = [
  { label: "Under $25", min: 0, max: 2500 },
  { label: "$25 to $50", min: 2500, max: 5000 },
  { label: "$50 to $100", min: 5000, max: 10000 },
  { label: "$100 to $200", min: 10000, max: 20000 },
  { label: "$200 & above", min: 20000, max: null },
] as const;

export type SearchResult = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  facets: Facets;
  corrected: string | null;
};

export function searchProducts(params: SearchParamsShape): SearchResult {
  const terms = params.k ? norm(params.k).split(/\s+/).filter(Boolean) : [];
  const all = allProducts();

  const scores = new Map<string, number>();
  let matched: Product[];

  if (terms.length) {
    matched = [];
    for (const p of all) {
      const s = score(p, terms);
      if (s > 0) {
        scores.set(p.id, s);
        matched.push(p);
      }
    }
  } else {
    matched = all;
  }

  // Facet counts come from one pass over the query-matched set, before filters are
  // applied — one loop, not one query per checkbox.
  const filtered = matched.filter((p) => matchesFilters(p, params));
  const facets = buildFacets(matched, params);

  const sort = params.sort ?? "featured";
  const sorted = sortProducts(filtered, sort, scores);

  const page = Math.max(1, params.page ?? 1);
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const items = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    items,
    total: sorted.length,
    page: Math.min(page, pages),
    pages,
    facets,
    corrected: sorted.length === 0 && terms.length ? suggest(params.k ?? "") : null,
  };
}

function buildFacets(matched: Product[], params: SearchParamsShape): Facets {
  const dept = new Map<string, number>();
  const brand = new Map<string, number>();
  const band = new Array(PRICE_BANDS.length).fill(0);
  const ratingBuckets = [4, 3, 2, 1].map((min) => ({ min, count: 0 }));
  let primeCount = 0;

  for (const p of matched) {
    dept.set(p.department, (dept.get(p.department) ?? 0) + 1);
    if (!params.i || params.i === "all" || p.department === params.i) {
      brand.set(p.brand, (brand.get(p.brand) ?? 0) + 1);
      PRICE_BANDS.forEach((b, i) => {
        if (p.priceCents >= b.min && (b.max == null || p.priceCents < b.max)) band[i]++;
      });
      for (const bucket of ratingBuckets) if (p.rating >= bucket.min) bucket.count++;
      if (p.prime) primeCount++;
    }
  }

  return {
    departments: DEPARTMENTS.map((d) => ({
      slug: d.slug,
      name: d.name,
      count: dept.get(d.slug) ?? 0,
    })).filter((d) => d.count > 0),
    brands: [...brand.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    ratings: ratingBuckets.filter((r) => r.count > 0),
    priceBands: PRICE_BANDS.map((b, i) => ({ ...b, count: band[i] })).filter(
      (b) => b.count > 0,
    ),
    primeCount,
  };
}

/** Nearest catalogue word to a failed query, used for "did you mean". */
function suggest(query: string): string | null {
  const vocab = new Set<string>();
  for (const p of allProducts()) {
    for (const w of norm(p.title).split(" ")) if (w.length > 3) vocab.add(w);
  }
  const q = norm(query).split(/\s+/).filter(Boolean);
  const fixed = q.map((term) => {
    let best = term;
    let bestScore = 0.6;
    for (const w of vocab) {
      const s = similarity(w, term);
      if (s > bestScore) {
        bestScore = s;
        best = w;
      }
    }
    return best;
  });
  const joined = fixed.join(" ");
  return joined === norm(query) ? null : joined;
}

export function getProductBySlug(slug: string): Product | undefined {
  return allProducts().find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return allProducts().find((p) => p.id === id);
}

export function getReviews(product: Product): Review[] {
  return reviewsFor(product);
}

/**
 * "Customers also viewed" — same department, closest price, best rated. A heuristic,
 * and the UI says so rather than dressing it up as a recommendation model.
 */
export function getRelated(product: Product, limit = 12): Product[] {
  return allProducts()
    .filter((p) => p.department === product.department && p.id !== product.id)
    .sort(
      (a, b) =>
        Math.abs(a.priceCents - product.priceCents) -
          Math.abs(b.priceCents - product.priceCents) || b.rating - a.rating,
    )
    .slice(0, limit);
}

export function getBestSellers(departmentSlug?: string, limit = 12): Product[] {
  return allProducts()
    .filter((p) => (departmentSlug ? p.department === departmentSlug : true))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, limit);
}

export function getDeals(limit = 12): Product[] {
  return allProducts()
    .filter((p) => p.listPriceCents > p.priceCents && p.stock > 0)
    .sort(
      (a, b) =>
        (b.listPriceCents - b.priceCents) / b.listPriceCents -
        (a.listPriceCents - a.priceCents) / a.listPriceCents,
    )
    .slice(0, limit);
}

export function getNewArrivals(limit = 12): Product[] {
  return allProducts()
    .slice()
    .sort((a, b) => a.addedDaysAgo - b.addedDaysAgo)
    .slice(0, limit);
}

export function discountPercent(p: Product): number {
  if (p.listPriceCents <= p.priceCents) return 0;
  return Math.round(((p.listPriceCents - p.priceCents) / p.listPriceCents) * 100);
}
