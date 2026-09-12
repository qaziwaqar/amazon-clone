# Loop protocol

Execution contract for working `plan/phases/` autonomously. Read this **first** on every
iteration, before touching any phase file.

## Single source of truth

`plan/PROGRESS.md` is authoritative. Phase files describe *what* to do; `PROGRESS.md`
records *what happened*. If they disagree, `PROGRESS.md` wins.

## One iteration

1. Read `plan/PROGRESS.md`. Find the first phase whose status is `TODO` or `WIP`.
2. Read that phase file. Take the **first unchecked task only**. Not the whole phase.
3. Do it.
4. Run the phase's **Verify** commands. They must pass.
5. Tick the task box, commit code + plan change together, append one line to the
   `PROGRESS.md` ledger.
6. If every box in the phase is ticked and its Exit criteria hold, set that phase
   `DONE`, increment `phases_done`.
7. Evaluate stop conditions below. Stop, or schedule the next iteration.

One task per iteration. Not one phase. A task that turns out to be three tasks gets
split in the phase file, and only the first is done.

## Stop conditions — checked every iteration, in this order

The loop **must** terminate. Any one of these ends it.

| # | Condition | Action |
|---|---|---|
| 1 | `phases_done == phases_total` | `STOP: complete`. Report. |
| 2 | `iteration > iteration_budget` (see `PROGRESS.md`) | `STOP: budget exhausted`. Report what remains. Do **not** raise the budget; that is a human call. |
| 3 | Current phase is `BLOCKED` and every other phase is `DONE` or also `BLOCKED` | `STOP: blocked`. Name the blocker and who must clear it. |
| 4 | Two consecutive iterations with no box ticked and no commit | `STOP: no progress`. Report the loop, do not retry a third time. |
| 5 | Same Verify command failed 3 times on the same task | `STOP: stuck`. Paste real output. No further attempts. |
| 6 | A task needs a credential, account, or paid tier | **Build it against the mock adapter and carry on.** See "No blocking on credentials" below. Only a task that is *physically* impossible without the credential — pushing a remote, importing to Vercel, recording a video — may block, and it blocks that task alone, never the phase. |
| 7 | Working tree has uncommitted changes at iteration start that the loop did not make | `STOP: dirty tree`. Never commit someone else's work-in-progress. |

Stopping is a success outcome for 1, and a correct outcome for the rest. Never
"keep going to be safe", never invent extra tasks to fill a budget, never spawn a
follow-up loop to get around a stop.

## No half-built surface ships

A route that exists must be finished. No placeholder pages, no "wired in a later phase",
no palette swatches standing in for a storefront. If a phase cannot complete a surface,
the surface does not get a route until it can.

Concretely:

- A page either renders real content from the data layer or it does not exist yet.
- Every interactive control does the thing it looks like it does. An inert button is a
  bug, not a stub.
- A helper that returns a constant so a component can compile is forbidden. Return real
  data from the mock adapter instead.
- Deploy canaries are deleted by the phase that replaces them, in that phase's commit.

## No blocking on credentials

The data layer is an interface, not a database. `src/lib/queries/*` is the only thing
the UI talks to, and it is backed by `src/lib/data/` — a deterministic in-repo catalogue
that needs no account, no connection string, and no network.

So a missing `DATABASE_URL` never blocks a feature. It blocks *swapping the adapter*,
which is one file and is not on the critical path to a working product. The same holds
for auth, orders, and the cart: cookie-backed, real behaviour, no vendor.

What this buys: the product is complete and demoable at every commit, and a grader who
clones the repo and runs `npm run dev` sees the whole thing with zero setup.

## Scope fence

In-scope: what a phase file lists. Out-of-scope: anything in the **Not this phase**
section of that file, and anything in `plan/README.md`'s Cut list. A good idea that is
out of scope gets appended to `plan/PROGRESS.md` under **Deferred**, not built.

## Commit discipline

One commit per ticked task. Code and the plan-file tick land in the **same** commit, so
`git log` shows real working order. `.agent-logs/` is committed as it accumulates, never
in one dump. Commit messages are written in normal English, not caveman.

## If run under `/loop`

Dynamic mode: call `ScheduleWakeup` with `stop: true` the moment any stop condition
above fires. Do not schedule "one more check". Interval mode: the same conditions apply;
report the stop and stop acting.
