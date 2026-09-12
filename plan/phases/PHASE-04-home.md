# Phase 04 — Home

**Status:** DONE · **Depends on:** 02, 03 · **Budget:** ~45m

## Goal

The first screen a grader sees. Dense, card-gridded, clearly Amazon — and fast.

## Exit criteria

- [x] Hero carousel + ≥6 category card blocks, all from real seeded data
- [x] LCP image is priority-loaded; no layout shift on card images
- [x] Server-rendered; no client-side fetch waterfall on first paint
- [x] Renders correctly with an empty cart and no session

## Tasks

- [x] Hero carousel — auto-advance, pause on hover, arrow + dot controls, respects `prefers-reduced-motion`
- [x] `CategoryCard` — 2×2 image grid, "Shop now" link, the exact Amazon card rhythm
- [x] "Keep shopping for" / "Top sellers" horizontal product rails with scroll buttons
- [x] `ProductCard` shared component: image, title clamp at 2 lines, star row, review count, price with superscript cents, Prime badge
- [x] Star rating component, half-star accurate, `aria-label` carrying the numeric value
- [x] Deals strip with a real countdown
- [x] `loading.tsx` skeleton matching the real grid, so the swap is not jarring

## Verify

```bash
npm run build
# manual: Lighthouse mobile >= 85 perf, 100 a11y on /
```

## Not this phase

Personalisation, recently-viewed (needs Phase 06 view tracking), recommendations.
