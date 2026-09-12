#!/usr/bin/env bash
# Thin wrapper so .claude/settings.json stays readable.
# $1 is "prompt" (UserPromptSubmit) or "response" (Stop). Hook payload arrives on stdin.
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$DIR/capture.py" "$1"
