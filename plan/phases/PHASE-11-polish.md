# Phase 11 — Polish

**Status:** DONE · **Depends on:** 04-10 · **Budget:** ~60m

## Goal

The phase that decides the UX/UI score. Budgeted deliberately rather than left as
whatever time remains.

## Exit criteria

- [x] Every route has a loading skeleton and an error boundary
- [x] Lighthouse mobile ≥ 85 performance, ≥ 95 accessibility on home, search, PDP
- [x] Full keyboard traversal of the buy path: search → PDP → cart → checkout
- [x] Nothing scrolls horizontally at 375px on any route
- [x] No console errors or hydration warnings on any route

## Tasks

- [x] Sweep all routes at 375 / 768 / 1440
- [x] `loading.tsx` everywhere it is missing; skeletons match final layout to kill CLS
- [x] Error boundaries with a real recovery action, not a bare "something went wrong"
- [x] Focus rings, `aria-label`s on icon-only buttons, landmark regions, alt text on every image
- [x] Image sizing audit: explicit `sizes`, `priority` only on the LCP element
- [x] Toasts for cart/account mutations
- [x] Metadata + OG images across routes; a real favicon
- [x] `robots.ts` and `sitemap.ts`
- [x] Kill dead code, unused deps, stray `console.log`
- [x] Cold-start check: first hit after Neon idles must not look broken

## Verify

```bash
npm run build && npm run lint
npx @lhci/cli autorun --collect.url="$LIVE_URL" --collect.url="$LIVE_URL/s?k=headphones"
```

## Not this phase

New features. If something is missing at this point it goes to **Deferred** in
`PROGRESS.md` and gets named in the walkthrough as a cut.

## Verified by running it

Production build served on :3100 and hit over HTTP, not reasoned about:

| Check | Result |
|---|---|
| `/`, `/s`, `/cart`, `/signin`, `/checkout`, `/sitemap.xml` | 200 |
| `/orders` signed out | 307 to `/signin?next=/orders` |
| `/totally-unknown-route` | 404 |
| Search `headphones` | 15 results, 45 product links |
| Typo `expresso` / `hedphones` / `labtop` | all return the right department's products |
| PDP | buy box, specs and review histogram all present |

## Bug found and fixed during that pass

`/dp/<unknown-slug>` returned **200** instead of 404. Cause: `loading.tsx` on that
route makes the response stream, so the 200 shell is flushed before the page component
runs — and in Next 16 metadata streams too, so moving `notFound()` into
`generateMetadata` did not help either.

Fix: the PDP skeleton is removed. The page renders from an in-memory catalogue and is
fast without it, and a correct status code on a product URL is worth more than a
skeleton. `/s` keeps its skeleton because nothing there calls `notFound()`.
