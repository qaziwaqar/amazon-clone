#!/usr/bin/env python3
"""
Agent capture hook for the 8x assignment.

Appends every prompt and every end-of-turn response to .agent-logs/<session>.md.

Invoked twice per turn by .claude/settings.json:
  UserPromptSubmit -> capture.py prompt    (stdin payload carries the verbatim prompt)
  Stop             -> capture.py response  (stdin payload carries the transcript path)

What is captured: the prompt text, the assistant's visible text output, a UTC timestamp,
and the model name. What is deliberately dropped: thinking blocks, tool_use blocks, and
tool_result blocks. See CAPTURE-TEST.md for the reasoning.

Never fails loudly: any exception is written to .agent-logs/.capture-errors.log and the
process still exits 0, so a bug in here can never block a build.
"""

import glob
import json
import os
import re
import sys
import time
from datetime import datetime, timezone

# .claude/hooks/capture.py -> repo root. Derived from __file__ rather than
# CLAUDE_PROJECT_DIR so the hook also works when that env var is absent.
REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
LOG_DIR = os.path.join(REPO, ".agent-logs")
ERROR_LOG = os.path.join(LOG_DIR, ".capture-errors.log")

AUTHOR = "qaziwaqar7"
PROJECT = "amazon-clone"
TOOL = "claude-code"
FALLBACK_MODEL = "claude-opus-5"


def utc_now():
    """ISO8601 with milliseconds and a Z suffix, matching the assignment's format."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
        f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"


def log_error(message):
    try:
        os.makedirs(LOG_DIR, exist_ok=True)
        with open(ERROR_LOG, "a") as fh:
            fh.write(f"{utc_now()} {message}\n")
    except Exception:
        pass


def read_transcript(path):
    """Parse the session JSONL. Tolerates partial final lines mid-write."""
    if not path or not os.path.exists(path):
        return []
    entries = []
    with open(path, "r", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                entries.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return entries


def is_human_prompt(entry):
    """
    True for a real user turn.

    Tool results are also recorded with type "user", so a user entry whose content
    array contains a tool_result is machine traffic, not a human prompt.
    """
    if entry.get("type") != "user":
        return False
    if entry.get("isMeta") or entry.get("isVisibleInTranscriptOnly"):
        return False
    content = entry.get("message", {}).get("content")
    if isinstance(content, str):
        return bool(content.strip())
    if isinstance(content, list):
        has_tool_result = any(
            isinstance(b, dict) and b.get("type") == "tool_result" for b in content
        )
        return not has_tool_result
    return False


def model_from_transcript(entries):
    for entry in reversed(entries):
        if entry.get("type") == "assistant":
            model = entry.get("message", {}).get("model")
            if model:
                return model
    return FALLBACK_MODEL


def turn_bounds(entries):
    """[(start, end)] index pairs, one per human prompt, end exclusive."""
    starts = [i for i, e in enumerate(entries) if is_human_prompt(e)]
    return [
        (starts[n], starts[n + 1] if n + 1 < len(starts) else len(entries))
        for n in range(len(starts))
    ]


def assistant_text(entries, start, end):
    """
    Every assistant text block in [start, end), in order.

    Text between tool calls is kept: in this harness it is shown to the user and is
    part of what came back. thinking / tool_use / tool_result blocks are skipped.
    """
    chunks = []
    for entry in entries[start:end]:
        if entry.get("type") != "assistant":
            continue
        content = entry.get("message", {}).get("content")
        if isinstance(content, str):
            if content.strip():
                chunks.append(content.strip())
            continue
        for block in content or []:
            if not isinstance(block, dict):
                continue
            if block.get("type") != "text":
                continue
            text = block.get("text", "").strip()
            if text:
                chunks.append(text)
    return "\n\n".join(chunks)


def last_assistant_timestamp(entries, start, end):
    for entry in reversed(entries[start:end]):
        if entry.get("type") == "assistant" and entry.get("timestamp"):
            return entry["timestamp"]
    return None


def final_response(entries):
    """Assistant text since the last human prompt."""
    bounds = turn_bounds(entries)
    if not bounds:
        return ""
    start, end = bounds[-1]
    return assistant_text(entries, start + 1, end)


def reconcile(path, entries, short_id, model, up_to=None):
    """
    Self-heal any PROMPT in the log that has no matching RESPONSE.

    The Stop hook can fire before the harness has flushed the final assistant message to
    the transcript JSONL. The retry loop in response mode usually wins that race; this is
    the backstop for when it does not, so a turn can never silently vanish from the log.

    Only ever called from prompt mode, before the incoming PROMPT is appended. Every turn
    it can see is therefore finished. `up_to` caps that explicitly for manual repair runs,
    where a turn may still be in flight and would otherwise be captured half-written.
    """
    highest = prompt_count(path)
    if up_to is not None:
        highest = min(highest, up_to)
    if highest == 0:
        return
    bounds = turn_bounds(entries)
    for num in range(1, highest + 1):
        with open(path, "r", errors="replace") as fh:
            content = fh.read()
        if f"[LOG_ENTRY type=RESPONSE num={num} " in content:
            continue
        if len(bounds) < num:
            continue
        start, end = bounds[num - 1]
        body = assistant_text(entries, start + 1, end)
        if not body.strip():
            continue
        timestamp = last_assistant_timestamp(entries, start + 1, end) or utc_now()
        insert_response(
            path, num, short_id, model, timestamp, body,
            note="capture: reconciled (Stop fired before the transcript flushed)",
        )


def log_path_for(session_id, now):
    """One file per session. Reuse the existing file if this session already has one."""
    os.makedirs(LOG_DIR, exist_ok=True)
    existing = sorted(glob.glob(os.path.join(LOG_DIR, f"*_{session_id}.md")))
    if existing:
        return existing[0]
    stamp = now.replace(":", "-").replace("T", "_")[:19]
    return os.path.join(LOG_DIR, f"{stamp}_{session_id}.md")


def ensure_header(path, session_id, short_id, model, now):
    if os.path.exists(path):
        return
    date = now[:10]
    header = (
        "---\n"
        f"session_id: {session_id}\n"
        f"date: {date}\n"
        f"author: {AUTHOR}\n"
        f"model: {model}\n"
        f"tool: {TOOL}\n"
        f"project: {PROJECT}\n"
        "total_exchanges: 0\n"
        f"first_prompt_time: {now}\n"
        f"last_prompt_time: {now}\n"
        "---\n\n"
        f"# Session Log - {date}\n\n"
        f"Session: `{short_id}` | Project: `{PROJECT}` | Author: `{AUTHOR}`\n\n"
        "---\n\n"
    )
    with open(path, "w") as fh:
        fh.write(header)


def prompt_count(path):
    if not os.path.exists(path):
        return 0
    with open(path, "r", errors="replace") as fh:
        return len(re.findall(r"^\[LOG_ENTRY type=PROMPT ", fh.read(), re.M))


def already_logged(path, kind, num, body):
    """
    Guard against a duplicate entry if an event fires twice for the same turn.
    Only an identical body is treated as a duplicate; anything else gets appended,
    because a confusing-but-honest log beats a silently dropped response.
    """
    if not os.path.exists(path):
        return False
    with open(path, "r", errors="replace") as fh:
        content = fh.read()
    marker = f"[LOG_ENTRY type={kind} num={num} "
    if marker not in content:
        return False
    return body.strip() in content


def build_entry(kind, num, short_id, model, now, body, note=None):
    entry = (
        f"[LOG_ENTRY type={kind} num={num} session={short_id}]\n"
        f"timestamp: {now}\n"
        f"model: {model}\n"
    )
    if note:
        entry += f"{note}\n"
    return entry + f"\n{body}\n\n\n"


def append_entry(path, kind, num, short_id, model, now, body, note=None):
    with open(path, "a") as fh:
        fh.write(build_entry(kind, num, short_id, model, now, body, note))


def insert_response(path, num, short_id, model, now, body, note=None):
    """
    Place a recovered RESPONSE in chronological position rather than at EOF.

    A gap being repaired is not always the most recent turn, so appending would put the
    response after later prompts and misrepresent the order the work happened in.
    """
    entry = build_entry("RESPONSE", num, short_id, model, now, body, note)
    with open(path, "r", errors="replace") as fh:
        content = fh.read()
    marker = f"[LOG_ENTRY type=PROMPT num={num + 1} "
    index = content.find(marker)
    content = content + entry if index == -1 else content[:index] + entry + content[index:]
    with open(path, "w") as fh:
        fh.write(content)


def update_frontmatter(path, total, now, model):
    with open(path, "r", errors="replace") as fh:
        content = fh.read()
    head, sep, tail = content.partition("\n---\n")
    if not sep:
        return
    head = re.sub(r"^total_exchanges: .*$", f"total_exchanges: {total}", head, flags=re.M)
    head = re.sub(r"^last_prompt_time: .*$", f"last_prompt_time: {now}", head, flags=re.M)
    head = re.sub(r"^model: .*$", f"model: {model}", head, flags=re.M)
    with open(path, "w") as fh:
        fh.write(head + sep + tail)


def main():
    mode = sys.argv[1] if len(sys.argv) > 1 else "prompt"
    raw = sys.stdin.read()
    payload = json.loads(raw) if raw.strip() else {}

    session_id = payload.get("session_id") or "unknown-session"
    short_id = session_id.split("-")[0]
    transcript_path = payload.get("transcript_path")
    now = utc_now()

    entries = read_transcript(transcript_path)
    model = model_from_transcript(entries)

    if mode == "prompt":
        body = payload.get("prompt", "")
        if not body.strip():
            return
        path = log_path_for(session_id, now)
        ensure_header(path, session_id, short_id, model, now)
        # Backstop: fill in the previous turn's response if Stop missed it.
        reconcile(path, entries, short_id, model)
        num = prompt_count(path) + 1
        if already_logged(path, "PROMPT", num, body):
            return
        append_entry(path, "PROMPT", num, short_id, model, now, body)
        update_frontmatter(path, num, now, model)
        return

    # The harness may not have flushed the final assistant message to the transcript by
    # the time Stop fires, so poll briefly rather than logging an empty response.
    body = final_response(entries)
    for _ in range(30):
        if body.strip():
            break
        time.sleep(0.1)
        entries = read_transcript(transcript_path)
        body = final_response(entries)
    if not body.strip():
        log_error("response mode: no assistant text found after 3s of polling")
        return
    now = utc_now()
    path = log_path_for(session_id, now)
    ensure_header(path, session_id, short_id, model, now)
    num = max(prompt_count(path), 1)
    if already_logged(path, "RESPONSE", num, body):
        return
    append_entry(path, "RESPONSE", num, short_id, model, now, body)
    update_frontmatter(path, prompt_count(path), now, model)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:  # never block the session
        log_error(f"{type(exc).__name__}: {exc}")
    # UserPromptSubmit stdout is injected into the model's context, so print nothing.
    sys.exit(0)
