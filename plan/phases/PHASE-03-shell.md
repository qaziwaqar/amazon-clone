# Phase 03 — App shell

**Status:** TODO · **Depends on:** 01 · **Budget:** ~50m

## Goal

Header, nav, and footer that read as Amazon at a glance and work at 375px. This is the
frame every later phase renders inside, so it lands before page work.

## Exit criteria

- [ ] Header matches the real three-row structure: deliver-to, search, account/orders/cart, then the department nav strip
- [ ] Search box is keyboard-reachable, submits on Enter, and has a visible focus ring
- [ ] Cart badge reflects real item count, server-rendered (no count flash on load)
- [ ] Nothing scrolls horizontally at 375px
- [ ] Footer with back-to-top and the four-column link block

## Tasks

- [ ] `src/app/layout.tsx` — fonts, tokens, header, footer, skip-to-content link
- [ ] `Header` — squid-ink bar, logo, deliver-to (static city), search with category dropdown, account menu, orders, cart with badge
- [ ] Department nav strip, horizontally scrollable on mobile without a page-level scrollbar
- [ ] `Footer` — back-to-top, four link columns, locale row
- [ ] Mobile header collapse: hamburger, search on its own row
- [ ] Loading and empty primitives: `Skeleton`, `EmptyState`
- [ ] `not-found.tsx` and `error.tsx` in Amazon's dog-not-found register

## Verify

```bash
npm run build
# manual: 375px / 768px / 1440px, tab through header, no horizontal scroll
```

## Not this phase

Search *results* (Phase 05), account menu contents beyond links (Phase 08), live
autocomplete (Phase 05 stretch).
