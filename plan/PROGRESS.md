# Progress ledger

Authoritative state. The loop reads this first and writes to it last.

```yaml
iteration: 2
iteration_budget: 45        # hard cap; exhausting it stops the loop (LOOP.md #2)
phases_total: 13
phases_done: 1
consecutive_no_progress: 0
status: RUNNING             # RUNNING | STOP:complete | STOP:budget | STOP:blocked | STOP:no-progress | STOP:stuck | STOP:dirty
```

## Phase board

| # | Phase | Status | Blocker |
|---|---|---|---|
| 00 | [Capture gate](phases/PHASE-00-capture.md) | DONE | — |
| 01 | [Foundation + first deploy](phases/PHASE-01-foundation.md) | BLOCKED | needs GitHub repo URL + Vercel login for the deploy task |
| 02 | [Data model + seed](phases/PHASE-02-data.md) | TODO | needs Neon `DATABASE_URL` |
| 03 | [App shell](phases/PHASE-03-shell.md) | WIP | — |
| 04 | [Home](phases/PHASE-04-home.md) | TODO | — |
| 05 | [Search + facets](phases/PHASE-05-search.md) | TODO | — |
| 06 | [Product page](phases/PHASE-06-pdp.md) | TODO | — |
| 07 | [Cart](phases/PHASE-07-cart.md) | TODO | — |
| 08 | [Auth](phases/PHASE-08-auth.md) | TODO | — |
| 09 | [Checkout](phases/PHASE-09-checkout.md) | TODO | — |
| 10 | [Orders](phases/PHASE-10-orders.md) | TODO | — |
| 11 | [Polish](phases/PHASE-11-polish.md) | TODO | — |
| 12 | [Hand-in](phases/PHASE-12-handin.md) | TODO | needs live URL + repo URL + walkthrough recorded by human |

## Open human blockers

Nothing below can be produced by the agent. Each one blocks a specific phase; the loop
skips past to the next non-blocked phase rather than waiting.

1. **Neon pooled `DATABASE_URL`** — blocks Phase 02 migration + seed.
2. **Public GitHub repo URL** — `gh` is not installed, remote must be wired by hand. Blocks the Phase 01 deploy task.
3. **Vercel account linked to that repo** — blocks the Phase 01 deploy task.
4. **`/recon/` screenshots** — improves fidelity everywhere, blocks nothing. Directory exists and is empty.
5. **Walkthrough video, camera on, ≤5 min** — blocks Phase 12 only.

## Ledger

One line per ticked task. Appended, never edited.

| iter | date (UTC) | phase | task | commit |
|---|---|---|---|---|
| — | 2026-09-12 | 00 | capture hook installed, two canaries green, `CAPTURE-TEST.md` written | `89e38f5` |
| 1 | 2026-09-12 | 01 | scaffold, tokens, lib skeleton, deploy-canary page — build and lint clean | `7de1d0c` |
| 2 | 2026-09-12 | 03 | header, department nav, footer, skeleton/empty primitives, 404 + error routes | pending |

## Deferred

Good ideas that are out of scope. Recorded so they are not silently dropped, and not
built unless a human promotes them.

- **Mobile hamburger drawer** (Phase 03). Scrollable department strip covers the need for now.
- **Header cart badge reading real data** (Phase 03 → Phase 07). Stubbed at 0; one-line swap in `src/lib/cart.ts`.
