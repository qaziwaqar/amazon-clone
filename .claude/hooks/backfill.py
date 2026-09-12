#!/usr/bin/env python3
"""
One-time recovery of turns that happened BEFORE the capture hook was installed.

The hook can only capture from the moment it exists. The first session of this project
spent its opening turns installing the hook itself, so those turns would otherwise be
missing from .agent-logs/. This script reconstructs them from the Claude Code session
transcript and marks the file as backfilled so nothing is passed off as live capture.

Usage:
    python3 .claude/hooks/backfill.py <transcript.jsonl>

Refuses to overwrite a log file that already has entries in it, so it can never clobber
anything the live hook wrote.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from capture import (  # noqa: E402
    AUTHOR,
    PROJECT,
    TOOL,
    LOG_DIR,
    is_human_prompt,
    model_from_transcript,
    read_transcript,
)


def prompt_text(entry):
    content = entry.get("message", {}).get("content")
    if isinstance(content, str):
        return content.strip()
    parts = []
    for block in content or []:
        if isinstance(block, dict) and block.get("type") == "text":
            parts.append(block.get("text", "").strip())
    return "\n\n".join(p for p in parts if p)


def assistant_text(entries):
    chunks = []
    for entry in entries:
        if entry.get("type") != "assistant":
            continue
        content = entry.get("message", {}).get("content")
        if isinstance(content, str):
            if content.strip():
                chunks.append(content.strip())
            continue
        for block in content or []:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text", "").strip()
                if text:
                    chunks.append(text)
    return "\n\n".join(chunks)


def main():
    transcript = sys.argv[1]
    entries = read_transcript(transcript)
    if not entries:
        sys.exit(f"no entries parsed from {transcript}")

    session_id = next(
        (e.get("sessionId") for e in entries if e.get("sessionId")),
        os.path.basename(transcript).replace(".jsonl", ""),
    )
    short_id = session_id.split("-")[0]
    model = model_from_transcript(entries)

    # Split the transcript into turns at each human prompt.
    turns = []
    for index, entry in enumerate(entries):
        if is_human_prompt(entry):
            turns.append([index, None])
            if len(turns) > 1:
                turns[-2][1] = index
    if turns:
        turns[-1][1] = len(entries)

    os.makedirs(LOG_DIR, exist_ok=True)
    first_ts = entries[turns[0][0]].get("timestamp", "") if turns else ""
    stamp = first_ts.replace(":", "-").replace("T", "_")[:19] or "backfill"
    path = os.path.join(LOG_DIR, f"{stamp}_{session_id}.md")

    if os.path.exists(path) and "[LOG_ENTRY" in open(path).read():
        sys.exit(f"refusing to overwrite existing entries in {path}")

    date = (first_ts or "")[:10]
    out = [
        "---",
        f"session_id: {session_id}",
        f"date: {date}",
        f"author: {AUTHOR}",
        f"model: {model}",
        f"tool: {TOOL}",
        f"project: {PROJECT}",
        f"total_exchanges: {len(turns)}",
        f"first_prompt_time: {first_ts}",
        f"last_prompt_time: {entries[turns[-1][0]].get('timestamp', '') if turns else ''}",
        "capture_method: backfilled-from-transcript",
        "---",
        "",
        f"# Session Log - {date}",
        "",
        f"Session: `{short_id}` | Project: `{PROJECT}` | Author: `{AUTHOR}`",
        "",
        "> NOTE: this session predates the capture hook — these turns were the ones that",
        "> built the hook. Reconstructed from the Claude Code session transcript by",
        "> `.claude/hooks/backfill.py`. Every later session is captured live by the hook.",
        "",
        "---",
        "",
    ]

    num = 0
    for start, end in turns:
        num += 1
        p_entry = entries[start]
        out.append(f"[LOG_ENTRY type=PROMPT num={num} session={short_id}]")
        out.append(f"timestamp: {p_entry.get('timestamp', '')}")
        out.append(f"model: {model}")
        out.append("")
        out.append(prompt_text(p_entry))
        out.append("")
        out.append("")

        body = assistant_text(entries[start + 1:end])
        if not body:
            continue
        last_ts = next(
            (
                e.get("timestamp", "")
                for e in reversed(entries[start + 1:end])
                if e.get("type") == "assistant"
            ),
            "",
        )
        out.append(f"[LOG_ENTRY type=RESPONSE num={num} session={short_id}]")
        out.append(f"timestamp: {last_ts}")
        out.append(f"model: {model}")
        out.append("")
        out.append(body)
        out.append("")
        out.append("")

    with open(path, "w") as fh:
        fh.write("\n".join(out) + "\n")
    print(path)


if __name__ == "__main__":
    main()
