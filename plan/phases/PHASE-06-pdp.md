# Phase 06 — Product page

**Status:** TODO · **Depends on:** 02, 03 · **Budget:** ~70m

## Goal

Where the buy decision happens. Gallery, buy box, variants, reviews — the four things
that make a PDP feel real.

## Exit criteria

- [ ] `/dp/[slug]` server-rendered with correct metadata (OG image, title, price)
- [ ] Image gallery: thumbnail rail, hover-zoom on desktop, swipe on mobile
- [ ] Buy box pinned right on desktop: price, delivery estimate, stock, qty, add-to-cart, buy-now
- [ ] Variant switch (colour / size) updates price, image, and URL without a full reload
- [ ] Reviews: histogram, sorted list, verified badges

## Tasks

- [ ] Route, data loader, `generateMetadata`, 404 on unknown slug
- [ ] Gallery with lens-zoom desktop / swipeable mobile
- [ ] Title block: title, brand link, star row linking to reviews anchor, answered-questions line
- [ ] Price block: current, list, "Save X%", per-unit price where sensible
- [ ] Buy box: stock state, delivery date computed from a fixed offset, qty select, both CTAs
- [ ] Variant selector, swatch for colour, pill for size; unavailable combinations disabled not hidden
- [ ] "About this item" bullets + specification table
- [ ] Review section: rating histogram bars, filter by star, sort by helpful/recent
- [ ] "Customers also viewed" rail — same-category heuristic, honest about being one
- [ ] Record a view for recently-viewed (cookie, capped at 20)

## Verify

```bash
npm run build
# manual: switch variant -> URL, price and image all change together; reload holds state
```

## Not this phase

Write-a-review (cut list), Q&A submission, size guides, 360° spin.
