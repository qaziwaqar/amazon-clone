# Progress ledger

Authoritative state. The loop reads this first and writes to it last.

```yaml
iteration: 5
iteration_budget: 45
phases_total: 13
phases_done: 5
consecutive_no_progress: 0
status: RUNNING
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
| 05 | [Search + facets](phases/PHASE-05-search.md) | TODO | — |
| 06 | [Product page](phases/PHASE-06-pdp.md) | TODO | — |
| 07 | [Cart](phases/PHASE-07-cart.md) | TODO | cookie-backed, real behaviour |
| 08 | [Auth](phases/PHASE-08-auth.md) | TODO | signed cookie session, demo account |
| 09 | [Checkout](phases/PHASE-09-checkout.md) | TODO | simulated payment, labelled as such |
| 10 | [Orders](phases/PHASE-10-orders.md) | TODO | — |
| 11 | [Polish](phases/PHASE-11-polish.md) | TODO | — |
| 12 | [Hand-in](phases/PHASE-12-handin.md) | TODO | README + deploy guide |

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
- **Mobile hamburger drawer.** The scrollable department strip covers the same need.
- **Product photography.** Catalogue images are seeded placeholders, stated plainly in
  the README rather than passed off as real product shots.
