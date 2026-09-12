# Progress ledger

Authoritative state. The loop reads this first and writes to it last.

```yaml
iteration: 12
iteration_budget: 45
phases_total: 13
phases_done: 12
consecutive_no_progress: 0
status: STOP:blocked
```

## Course correction — 2026-09-12

The first pass treated a missing `DATABASE_URL` as a blocker and stopped with a token
palette on the live URL. That was wrong twice over: the deploy canary was a placeholder
route left in production, and no product work needed a database to begin with.

Corrected in `LOOP.md`: **no half-built surface ships**, and **credentials never block a
feature**. The catalogue is a deterministic in-repo dataset behind `src/lib/queries/*`.
Swapping it for Drizzle later is one file, and it is not on the critical path.

## Phase board

| # | Phase | Status | Note |
|---|---|---|---|
| 00 | [Capture gate](phases/PHASE-00-capture.md) | DONE | — |
| 01 | [Foundation](phases/PHASE-01-foundation.md) | DONE | canary route deleted by Phase 04, as required |
| 02 | [Catalogue data layer](phases/PHASE-02-data.md) | DONE | mock adapter; no credential needed |
| 03 | [App shell](phases/PHASE-03-shell.md) | DONE | cart badge now reads the real cart |
| 04 | [Home](phases/PHASE-04-home.md) | DONE | canary route deleted, as the rule requires |
| 05 | [Search + facets](phases/PHASE-05-search.md) | DONE | URL-driven, JS-free filters |
| 06 | [Product page](phases/PHASE-06-pdp.md) | DONE | variant state in the URL |
| 07 | [Cart](phases/PHASE-07-cart.md) | DONE | cookie-backed, real behaviour |
| 08 | [Auth](phases/PHASE-08-auth.md) | DONE | signed cookie session, demo account |
| 09 | [Checkout](phases/PHASE-09-checkout.md) | DONE | simulated payment, labelled as such |
| 10 | [Orders](phases/PHASE-10-orders.md) | DONE | — |
| 11 | [Polish](phases/PHASE-11-polish.md) | DONE | verified by HTTP, not by reading markup |
| 12 | [Hand-in](phases/PHASE-12-handin.md) | WIP | README done; live link and walkthrough need a human |

## Why the loop stopped

`LOOP.md` stop condition #3. Everything buildable is built: all twelve product phases
are done and verified against a running server. What remains is physically impossible
for the agent — pushing to a GitHub remote, importing to Vercel, and recording a
walkthrough.

## Remaining human blockers

Only two, and neither blocks a feature:

1. **Public GitHub repo URL** — `gh` is not installed, the remote is wired by hand.
2. **Vercel import** — produces the live link. `README.md` documents the steps.

`DATABASE_URL` is no longer a blocker. It is an optional upgrade path, documented in
`README.md` under Configuration.

## Ledger

| iter | date (UTC) | phase | task | commit |
|---|---|---|---|---|
| — | 2026-09-12 | 00 | capture hook installed, two canaries green, `CAPTURE-TEST.md` written | `89e38f5` |
| 1 | 2026-09-12 | 01 | scaffold, tokens, lib skeleton, deploy-canary page — build and lint clean | `7de1d0c` |
| 2 | 2026-09-12 | 03 | header, department nav, footer, skeleton/empty primitives, 404 + error routes | `17e4ff3` |
| 3 | 2026-09-12 | — | loop rules corrected: no unfinished surfaces, no blocking on credentials | `8d3a` |
| 4 | 2026-09-12 | 02 | 600-product deterministic catalogue, scored search, single-pass facets | `4a0c` |
| 5 | 2026-09-12 | 03,04 | cookie cart, product card/rail/carousel, full home page | pending |

## Deferred

Recorded, not built. Promoted only by a human.

- **Drizzle + Neon adapter.** The query layer is already the seam. Swap `src/lib/data/`
  for SQL without touching a component.
- **Product photography.** Catalogue images are keyword-matched stock photos, stated
  plainly in the README rather than passed off as real product shots.

## Reported-issue pass — 2026-09-12

Five issues raised after a real run-through. All fixed and verified against a running
server, not against the markup.

| # | Issue | Root cause | Fix |
|---|---|---|---|
| 1 | Checkout fields pre-filled, card included | `defaultValue` on every field | All removed; placeholders only, test-card hint in the payment callout |
| 2 | Place Order disabled, nothing happened | Button sat outside the form and disabled itself synchronously in its own click handler, which cancels the submission | Summary and button moved inside the form; `useFormStatus` drives pending. Verified end to end: 303 to the confirmation page, cart cleared, thank-you rendered |
| 3 | "All" button inert, no drawer | Never built — deferred in Phase 03 | Slide-in panel, Escape and backdrop close, scroll lock |
| 4 | Images did not match products | `picsum.photos` returns random photography | Keyword-matched `loremflickr` tags per product type, pinned per slot; generated tile as fallback when the host fails |
| 5 | Delivery address not clickable | Static label | Picker with opt-in GPS, browser-side reverse geocoding, ZIP fallback |

## Reported-issue pass 2 — 2026-09-12

| # | Issue | Root cause | Fix |
|---|---|---|---|
| 6 | Checkout completed with no sign-in | `/checkout` was never added to the middleware matcher, and neither the page nor the action checked | Gated in middleware, re-verified on the page with `getUser()`, and enforced inside `placeOrder` — a server action is a public endpoint regardless of which page renders it. Cart CTA now reads "Sign in to checkout" |

Verified over HTTP: signed out, `/checkout` and `/checkout/confirmation/*` both 307 to
`/signin?next=…`, and a direct POST of the placement action is refused. Signed in as the
demo account, the full path still completes — 303 to the confirmation page, thank-you
rendered, and the new order listed on `/orders`.

## Reported-issue pass 3 — 2026-09-12

Compared against a screenshot of the real header.

| # | Issue | Fix |
|---|---|---|
| 7 | No language support | Six-locale chrome dictionary, cookie-backed, `lang`/`dir` on `<html>`, RTL for Arabic with mirrored carousel and rail controls. Plus eight currencies that actually reprice the whole site, zero-decimal handling for PKR and INR, and fixed demo rates stated in the picker |
| 8 | Cart badge not aligned to the icon | Count now sits over the icon's top-right corner instead of centred above it, so it reads as part of the cart rather than a separate element |
| 9 | Nav missing Deals, Coupons, Browsing History, Gift Cards etc. | Six new destinations, each a working page: `/deals`, `/coupons`, `/gift-cards`, `/browsing-history`, `/buy-again`, `/help`. Gift cards are real catalogue products, so they add to the cart and check out through the ordinary path |

Prime Video, Registry and Sell are still absent on purpose: they are on the cut list,
and a dead link is worse than an honest omission.

Verified over HTTP: every new route 200 (`/buy-again` correctly 307s to sign-in when
signed out); `de`/`ar`/`zh` chrome translated; `<html lang>` and `dir` correct; and a
$25 gift card renders as 23,00 €, ‏91.75 د.إ‏, ¥181.00 and PKR 6,950.
