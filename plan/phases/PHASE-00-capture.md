# Phase 00 — Capture gate

**Status:** DONE · **Depends on:** nothing · **Blocks:** everything

## Goal

Automatic, hands-off capture of every prompt and final response into `.agent-logs/`,
proven from a session that did not create the config.

## Exit criteria

- [x] `UserPromptSubmit` + `Stop` hooks registered in repo-scoped `.claude/settings.json`
- [x] Canary 1 prompt **and** response in the log
- [x] Canary 2 lands from a second, fresh session
- [x] `CAPTURE-TEST.md` at repo root with both canaries pasted raw and the failures recorded
- [x] `.agent-logs/` is not in `.gitignore`

## Tasks

- [x] Write `capture.py` + `capture.sh`, register both hook events
- [x] Backfill the pre-hook turns of session 1, marked `capture_method: backfilled-from-transcript`
- [x] Fix the `Stop` transcript-flush race (retry loop + reconcile on next prompt)
- [x] Two-session canary run
- [x] `CAPTURE-TEST.md`, committed

## Verify

```bash
ls .agent-logs/*.md | wc -l          # >= 2
grep -c LOG_ENTRY .agent-logs/*.md   # prompts and responses present
grep -n agent-logs .gitignore        # must return nothing
```

## Not this phase

Any product code. This was a hard gate; `CLAUDE.md` forbids building before it passes.
