# Phase 02 — Data model and seed

**Status:** TODO · **Depends on:** 01 · **Budget:** ~60m · **No credential needed**

## Goal

A catalogue big enough that search, facets, and pagination are exercised for real. A
12-product demo hides every interesting bug.

**Deterministic in-repo data, not a database.** Every read goes through
`src/lib/queries/*`, which is the seam a Drizzle adapter drops into later. This is what
makes the product complete with zero setup: clone, `npm install`, `npm run dev`, and the
whole storefront is there.

## Exit criteria

- [ ] Migrations apply clean against Neon from a cold start
- [ ] ~600 products across ≥8 departments, each with images, price, rating, review count, ≥4 attributes
- [ ] Full-text + trigram indexes exist and are used (confirmed via `EXPLAIN`)
- [ ] Re-running the seed is idempotent, not duplicating rows

## Tasks

- [ ] Types in `src/lib/data/types.ts`: `Product`, `Variant`, `Review`, `Category`, `Order`
- [ ] Seeded PRNG (mulberry32) so the catalogue is byte-identical on every machine
- [ ] Catalogue generator: ~600 products, 8 departments, real titles/brands/specs per department — not lorem ipsum
- [ ] Review generator with a realistic skew (≈4.3 mean, J-shaped), not a flat distribution
- [ ] Variants where they make sense: colour and size, priced independently
- [ ] Query helpers in `src/lib/queries/` — `searchProducts`, `getProduct`, `getFacets`, `getRelated`, `getDepartmentRails`. Components never touch the dataset directly
- [ ] Scoring search: title > brand > description, plus a bigram fallback so typos still match
- [ ] Facet counts from a single pass over the filtered set, not one pass per facet value

## Verify

```bash
npm run build
npx tsx scripts/catalogue-stats.ts   # count, departments, price spread, rating mean
```

## Not this phase

UI of any kind. Data layer only.

## Notes

Images are seeded placeholders from a stable public host, deterministic per product id.
They are not real product photography and the README says so. The alternative — guessing
at a retailer's CDN paths — produces broken images, which look far worse than honest
placeholders.
