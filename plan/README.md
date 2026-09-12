# Plan

Rebuild of amazon.com. Phase-sequenced, loop-executable, bounded.

- **[LOOP.md](LOOP.md)** — execution contract and the stop conditions. Read first.
- **[PROGRESS.md](PROGRESS.md)** — authoritative state: phase board, blockers, ledger.
- **[phases/](phases/)** — one file per phase. Goal, exit criteria, tasks, verify commands.

## Ordering rationale

Deploy happens on **commit 1**, before any feature work. A deploy that breaks at hour 22
is the thing that actually sinks this; finding it at hour 2 costs nothing.

After that the order follows the shopper's path — shell, home, search, PDP, cart, auth,
checkout, orders — so that at every single point there is a demoable product, not a
half-wired one. Auth lands *after* cart on purpose: the guest cart is DB-backed via a
cookie token and merges on sign-in, which is only interesting if the cart exists first.

Polish and hand-in are real phases with real budget, not leftovers.

## Judged on

Speed, product judgement, UX/UI. Not completeness. Which makes the cut list a scored
artifact, not an apology.

## Cut list — deliberately not built

Named out loud in the walkthrough, so it reads as judgement rather than as gaps.

| Cut | Why |
|---|---|
| Seller Central / vendor tooling | Second product wearing the same skin. No shopper ever sees it. |
| Prime Video / Music / Photos | Media platform, not commerce. |
| Real payment rails | Stripe test mode is a card-collection flow that proves nothing about product judgement. Checkout simulates authorisation. |
| ML recommendations | Needs behavioural data that does not exist on a one-day-old seed set. Heuristic "also viewed" instead. |
| i18n / multi-marketplace | Pure surface area, zero signal. |
| Reviews with write path | Reviews are seeded and read-only. Writing them is a moderation problem, not a shopping one. |
| Warehouse / delivery tracking map | Fake data pretending to be live telemetry. |

## Stack

Next.js 15 App Router + TypeScript + Tailwind · Neon Postgres · Drizzle ORM · own auth
(bcrypt + JWT in an httpOnly cookie) · Postgres full-text + trigram search · Vercel Hobby.
Free tier throughout, no card required at any step.
