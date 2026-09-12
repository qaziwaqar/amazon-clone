# Phase 06 — Product page

**Status:** DONE · **Depends on:** 02, 03 · **Budget:** ~70m

## Goal

Where the buy decision happens. Gallery, buy box, variants, reviews — the four things
that make a PDP feel real.

## Exit criteria

- [x] `/dp/[slug]` server-rendered with correct metadata (OG image, title, price)
- [x] Image gallery: thumbnail rail, hover-zoom on desktop, swipe on mobile
- [x] Buy box pinned right on desktop: price, delivery estimate, stock, qty, add-to-cart, buy-now
- [x] Variant switch (colour / size) updates price, image, and URL without a full reload
- [x] Reviews: histogram, sorted list, verified badges

## Tasks

- [x] Route, data loader, `generateMetadata`, 404 on unknown slug
- [x] Gallery with lens-zoom desktop / swipeable mobile
- [x] Title block: title, brand link, star row linking to reviews anchor, answered-questions line
- [x] Price block: current, list, "Save X%", per-unit price where sensible
- [x] Buy box: stock state, delivery date computed from a fixed offset, qty select, both CTAs
- [x] Variant selector, swatch for colour, pill for size; unavailable combinations disabled not hidden
- [x] "About this item" bullets + specification table
- [x] Review section: rating histogram bars, filter by star, sort by helpful/recent
- [x] "Customers also viewed" rail — same-category heuristic, honest about being one
- [x] Record a view for recently-viewed (cookie, capped at 20)

## Verify

```bash
npm run build
# manual: switch variant -> URL, price and image all change together; reload holds state
```

## Not this phase

Write-a-review (cut list), Q&A submission, size guides, 360° spin.
