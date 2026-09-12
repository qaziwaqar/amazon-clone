# CAPTURE-TEST.md

Proof that automatic prompt/response capture is installed and firing, per step 4 of
`CLAUDE.md`. Written before any assignment code was built.

---

## 1. Tool and model

| | |
|---|---|
| **Tool** | Claude Code (VS Code extension, `claude` CLI backend) |
| **Model — planning and execution** | `claude-opus-5` (Opus 5) |
| **Split between plan/execute models** | None. One model does both. A switch mid-build would show up in the per-entry `model:` field. |
| **Automatic hook mechanism?** | Yes — Claude Code has a lifecycle hook system configured in `.claude/settings.json`. Verified against the Claude Code hooks reference, not guessed. |

Relevant hook events used:

- **`UserPromptSubmit`** — fires when a prompt is submitted, before the model sees it.
  The prompt text arrives on stdin as JSON.
- **`Stop`** — fires when the main agent finishes its turn. Payload on stdin carries
  `transcript_path`, a JSONL file of the whole session; the final assistant text for
  the turn is read out of it.

---

## 2. Mechanism and config files changed

| File | Role |
|---|---|
| [`.claude/settings.json`](.claude/settings.json) | Registers both hooks. Committed to the repo, so capture is repo-scoped and follows the clone. |
| [`.claude/hooks/capture.sh`](.claude/hooks/capture.sh) | Thin bash wrapper; passes `prompt` or `response` to the Python. |
| [`.claude/hooks/capture.py`](.claude/hooks/capture.py) | Does the work: parses the stdin payload, creates/append the session log, writes frontmatter, keeps `total_exchanges` and `last_prompt_time` current, and runs a reconcile pass (see §5). |
| [`.claude/hooks/backfill.py`](.claude/hooks/backfill.py) | One-off. Reconstructs the *first* session — the one that built the hook and therefore predates it — from the Claude Code session transcript. That log is marked `capture_method: backfilled-from-transcript` in its own frontmatter, so it is never passed off as live capture. |

`.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/capture.sh\" prompt" } ] }
    ],
    "Stop": [
      { "hooks": [ { "type": "command", "command": "bash \"$CLAUDE_PROJECT_DIR/.claude/hooks/capture.sh\" response" } ] }
    ]
  }
}
```

Nothing is manual. There is no command to remember to run. `.agent-logs/` is **not**
in `.gitignore`.

---

## 3. Log file paths

| Canary | Session | Log file |
|---|---|---|
| 1 | `5142e172` | [`.agent-logs/2026-09-12_10-31-29_5142e172-5596-44c0-80c5-519e56edd1fc.md`](.agent-logs/2026-09-12_10-31-29_5142e172-5596-44c0-80c5-519e56edd1fc.md) |
| 2 | `30ef6b9c` | [`.agent-logs/2026-09-12_11-08-57_30ef6b9c-306c-42c2-809b-971006897f88.md`](.agent-logs/2026-09-12_11-08-57_30ef6b9c-306c-42c2-809b-971006897f88.md) |

Canary 2 was sent from a **separate session that did not create the config** — a new
session file was created automatically by the hook, which is the point of step 4.3.

---

## 4. Canary entries, pasted raw

### Canary 1 — session `5142e172`

Raw excerpt, lines 201-222 of the session 1 log:

````
[LOG_ENTRY type=PROMPT num=4 session=5142e172]
timestamp: 2026-09-12T11:02:24.006Z
model: claude-opus-5

CAPTURE TEST — 8x assignment, Waqar Qazi


[LOG_ENTRY type=RESPONSE num=4 session=5142e172]
timestamp: 2026-09-12T11:07:39.049Z
model: claude-opus-5

Bug caught — canary landed as `num=3`, but **`RESPONSE num=3` is missing**. Probing why:

Confirmed: **flush race.** Turn 3's text is in the transcript *now*, but wasn't when `Stop` fired — so `final_response` returned empty and bailed. Two fixes: retry loop on `Stop`, plus a self-healing reconcile pass that runs on the *next* prompt so a gap can never survive.

Now the `main()` rework — retry loop on `Stop`, reconcile on prompt:

Reconcile filled `num=4` — but turn 4 is *this* turn, still in flight, so that entry is partial. Two real defects: reconcile appends instead of inserting (can't fix a non-latest gap), and it has no notion of an in-flight turn. Reverting and fixing both:

Gap repaired — correct chronological position, real transcript timestamp, honest `capture: reconciled` marker. `capture.py` is re-exec'd per hook fire, so the retry-loop fix is live immediately with no session reload.


````

### Canary 2 — session `30ef6b9c` (second session, hook self-started)

Raw excerpt, lines 19-45 of the session 2 log:

````
[LOG_ENTRY type=PROMPT num=1 session=30ef6b9c]
timestamp: 2026-09-12T11:08:57.967Z
model: claude-opus-5

<ide_selection>The user selected the lines 147 to 147 from /Users/waqar/Documents/github/amazon-clone/.agent-logs/2026-09-12_10-31-29_5142e172-5596-44c0-80c5-519e56edd1fc.md:
exact

This may or may not be related to the current task.</ide_selection>
CAPTURE TEST 2 — second session, Waqar Qazi


[LOG_ENTRY type=RESPONSE num=1 session=30ef6b9c]
timestamp: 2026-09-12T11:09:14.694Z
model: claude-opus-5

Canary 2 captured. New session file auto-created — hook fires outside originating session. Works.

**[.agent-logs/2026-09-12_11-08-57_30ef6b9c-306c-42c2-809b-971006897f88.md](.agent-logs/2026-09-12_11-08-57_30ef6b9c-306c-42c2-809b-971006897f88.md)**

- Frontmatter written on first prompt ✓
- `[LOG_ENTRY type=PROMPT num=1]` present, verbatim ✓
- RESPONSE entry lands when Stop hook fires end of this turn

One wrinkle: prompt captured includes editor's `<ide_selection>` wrapper block prepended by VSCode extension. That is raw input as delivered — no truncation, no cleanup — so leaving it. Flagging so you know it is not hook noise.

Next: once Stop hook writes this response, I paste both canary pairs raw into `CAPTURE-TEST.md`. Say go.

````

---

## 5. What did not work first

Left in deliberately. These are the real failures, in the order they happened.

### 5.1 The first session could not capture itself

The session that wrote the hook ran before the hook existed, so turns 1-2 of
`5142e172` were never captured live. Rather than fake them, `backfill.py`
reconstructs them from the Claude Code session transcript JSONL, and that file's
frontmatter carries `capture_method: backfilled-from-transcript` plus a note in the
body saying so. Every session after it is live-captured.

### 5.2 Transcript flush race on `Stop` — a whole response went missing

The first canary landed as `PROMPT num=3`, and **`RESPONSE num=3` never appeared.**

Cause: `Stop` fires at end of turn, but the assistant's final text had not yet been
flushed to the transcript JSONL when the hook read it. `final_response()` returned
empty and the hook bailed rather than writing a stub. The text was in the file
moments later — which is exactly why this is easy to miss if you only check once.

Two fixes, committed as `a38b5dd`:

1. A short retry/poll loop on `Stop`, so a slow flush is waited out.
2. A self-healing **reconcile pass** that runs on the *next* `UserPromptSubmit`: if
   the previous turn's response is missing from the log but present in the
   transcript, it is filled in. A gap cannot survive a subsequent prompt.

Reconciled entries are stamped `capture: reconciled (Stop fired before the transcript
flushed)` so they are visibly distinguishable from first-try captures. See
`RESPONSE num=3` in the session 1 log.

### 5.3 The first reconcile fix was itself wrong — twice

The first attempt **appended** the recovered entry to the end of the file instead of
inserting it at its chronological position, so it could only ever repair the most
recent gap. It also had no notion of an **in-flight turn**, so it "recovered"
`num=4` — the turn that was still being generated — and wrote a partial entry.

Reverted and redone: insert at correct position, use the real transcript timestamp,
and skip the currently-running turn. Because `capture.py` is re-exec'd on every hook
fire, the fix went live with no session reload — which also answered an open question
about whether editing hooks mid-session requires a restart. It does not for the
script; it does for `settings.json`.

### 5.4 IDE tags in the prompt payload

The VS Code extension prepends `<ide_opened_file>` / `<ide_selection>` blocks to the
prompt payload. These show up inside captured prompts.

Left in. `CLAUDE.md` says verbatim and in full, no cleanup — stripping them would be
editing the record to look tidier than it was. Documented here so they read as a
known harness artifact rather than hook noise.
