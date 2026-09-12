# Phase 11 — Polish

**Status:** TODO · **Depends on:** 04-10 · **Budget:** ~60m

## Goal

The phase that decides the UX/UI score. Budgeted deliberately rather than left as
whatever time remains.

## Exit criteria

- [ ] Every route has a loading skeleton and an error boundary
- [ ] Lighthouse mobile ≥ 85 performance, ≥ 95 accessibility on home, search, PDP
- [ ] Full keyboard traversal of the buy path: search → PDP → cart → checkout
- [ ] Nothing scrolls horizontally at 375px on any route
- [ ] No console errors or hydration warnings on any route

## Tasks

- [ ] Sweep all routes at 375 / 768 / 1440
- [ ] `loading.tsx` everywhere it is missing; skeletons match final layout to kill CLS
- [ ] Error boundaries with a real recovery action, not a bare "something went wrong"
- [ ] Focus rings, `aria-label`s on icon-only buttons, landmark regions, alt text on every image
- [ ] Image sizing audit: explicit `sizes`, `priority` only on the LCP element
- [ ] Toasts for cart/account mutations
- [ ] Metadata + OG images across routes; a real favicon
- [ ] `robots.ts` and `sitemap.ts`
- [ ] Kill dead code, unused deps, stray `console.log`
- [ ] Cold-start check: first hit after Neon idles must not look broken

## Verify

```bash
npm run build && npm run lint
npx @lhci/cli autorun --collect.url="$LIVE_URL" --collect.url="$LIVE_URL/s?k=headphones"
```

## Not this phase

New features. If something is missing at this point it goes to **Deferred** in
`PROGRESS.md` and gets named in the walkthrough as a cut.
