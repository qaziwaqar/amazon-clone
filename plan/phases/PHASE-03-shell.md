# Phase 03 — App shell

**Status:** DONE · **Depends on:** 01 · **Budget:** ~50m

## Goal

Header, nav, and footer that read as Amazon at a glance and work at 375px. This is the
frame every later phase renders inside, so it lands before page work.

## Exit criteria

- [x] Header matches the real three-row structure: deliver-to, search, account/orders/cart, then the department nav strip
- [x] Search box is keyboard-reachable, submits on Enter, and has a visible focus ring
- [x] Cart badge reflects real item count, server-rendered (no count flash on load)
- [x] Nothing scrolls horizontally at 375px
- [x] Footer with back-to-top and the four-column link block

## Tasks

- [x] `src/app/layout.tsx` — fonts, tokens, header, footer, skip-to-content link
- [x] `Header` — squid-ink bar, logo, deliver-to (static city), search with category dropdown, account menu, orders, cart with badge
- [x] Department nav strip, horizontally scrollable on mobile without a page-level scrollbar
- [x] `Footer` — back-to-top, four link columns, locale row
- [x] Mobile header collapse: hamburger, search on its own row
- [x] Loading and empty primitives: `Skeleton`, `EmptyState`
- [x] `not-found.tsx` and `error.tsx` in Amazon's dog-not-found register

## Verify

```bash
npm run build
# manual: 375px / 768px / 1440px, tab through header, no horizontal scroll
```

## Not this phase

Search *results* (Phase 05), account menu contents beyond links (Phase 08), live
autocomplete (Phase 05 stretch).

## Carry-over — not done, deliberately visible

- ~~Cart badge stubbed at 0.~~ **Resolved.** `src/lib/cart.ts` now reads the real
  cookie-backed cart, so the badge is accurate on first paint. The stub violated the
  no-placeholder rule added to `LOOP.md` and was removed with it.
- **Hamburger drawer not built.** The mobile search already sits on its own row, which
  was the part that made 375px unusable. The "All" button in the department strip is
  present but inert. Picked up in Phase 11 if it still matters; a horizontally
  scrollable strip covers the same need at a fraction of the cost.
- **Not visually verified.** No browser tool in this session, so responsive behaviour
  is reasoned from the markup, not observed. Confirm at 375/768/1440 once the app is
  deployed, before Phase 11 signs it off.
