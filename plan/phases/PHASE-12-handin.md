# Phase 12 — Hand-in

**Status:** TODO · **Depends on:** 11 · **Budget:** ~30m · **HUMAN BLOCKER: walkthrough recording**

## Goal

Submit what was asked for, in the form it was asked for. A live link, a public repo with
`.agent-logs/`, and a five-minute walkthrough with camera on.

## Exit criteria

- [ ] Live URL loads from a cold start, in a private window, on a phone
- [ ] Repo public, `.agent-logs/` present and committed incrementally throughout — not in one dump
- [ ] `README.md` with the live link, stack, what was built, what was cut and why
- [ ] `CAPTURE-TEST.md` accurate and unedited
- [ ] Walkthrough recorded, ≤5 min, camera on
- [ ] Both links pasted into the submission form and labelled

## Tasks

- [ ] `README.md` — live link at the top, quickstart, stack table, cut list with reasons, honest known-issues section
- [ ] Final pass over `.agent-logs/` for completeness — **read only, never edit an entry**
- [ ] Verify commit history shows logs interleaved with code, not appended at the end
- [ ] Demo credentials in the README, plus the one-click demo button on `/signin`
- [ ] Walkthrough script: 30s framing → 3min buy path end to end → 60s cuts and why → 30s on the agent log
- [ ] Cold-start check from a device that has never hit the site
- [ ] **(human)** record and upload the walkthrough
- [ ] **(human)** paste live link + repo link into the submission form, labelled

## Verify

```bash
git log --oneline | head -40          # logs interleaved with code
grep -rn "agent-logs" .gitignore      # must return nothing
curl -sSf -o /dev/null -w '%{http_code}\n' "$LIVE_URL"
```

## Notes

The walkthrough is scored. Lead with the buy path working end to end, then the cut list —
naming what was deliberately not built is product judgement, which is a scored axis.
