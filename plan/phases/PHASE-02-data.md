# Phase 02 — Data model and seed

**Status:** TODO · **Depends on:** 01 · **Budget:** ~60m · **HUMAN BLOCKER: Neon `DATABASE_URL`**

## Goal

Schema and a catalogue big enough that search, facets, and pagination are exercised for
real. A 12-product demo hides every interesting bug.

## Exit criteria

- [ ] Migrations apply clean against Neon from a cold start
- [ ] ~600 products across ≥8 departments, each with images, price, rating, review count, ≥4 attributes
- [ ] Full-text + trigram indexes exist and are used (confirmed via `EXPLAIN`)
- [ ] Re-running the seed is idempotent, not duplicating rows

## Tasks

- [ ] Install Drizzle + `drizzle-kit` + `postgres` driver; `drizzle.config.ts`
- [ ] Schema: `users`, `addresses`, `categories`, `products`, `product_images`, `product_variants`, `reviews`, `carts`, `cart_items`, `orders`, `order_items`
- [ ] Guest-cart support: `carts.session_token` nullable, `carts.user_id` nullable, exactly one of the two set
- [ ] `products.search_vector` generated column (`title` weight A, `brand` B, `description` C) + GIN index; `pg_trgm` index on `title` for typo tolerance
- [ ] Seed generator: deterministic (fixed RNG seed) so the catalogue is reproducible
- [ ] Seeded reviews with a realistic rating skew — 4.3 mean, not a flat distribution
- [ ] `npm run db:push` / `db:seed` scripts; document them in `.env.example` comments
- [ ] Query helpers in `src/lib/queries/` — every DB read goes through one, no inline SQL in components

## Verify

```bash
npm run db:push && npm run db:seed && npm run db:seed   # twice: must not duplicate
psql "$DATABASE_URL" -c "select count(*) from products;"                 # ~600
psql "$DATABASE_URL" -c "explain analyze select id from products where search_vector @@ plainto_tsquery('english','wireless headphones');"
```

## Not this phase

UI of any kind. Data layer only.

## Notes

Image URLs come from a stable remote CDN in the seed set — no file storage, no egress bill.
Whitelist those hosts in `next.config.ts` `images.remotePatterns` during this phase or every
image 404s in Phase 04 and the cause is non-obvious.
