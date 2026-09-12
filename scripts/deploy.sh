#!/usr/bin/env bash
#
# One-command deploy to Vercel, straight from this machine.
#
#   npm run deploy
#
# No git remote, no GitHub, no CI. Idempotent: run it as often as you like and it
# only does the work that is still outstanding.
#
# Flags:
#   --logs          stream everything Vercel prints, plus its debug output
#   --skip-checks   skip lint and the local build gate (faster, riskier)
#   --dry-run       print what would happen without touching Vercel
#   --scope <team>  deploy under a Vercel team instead of your personal account
#   --help
#
# Every Vercel call runs with a timeout and with stdin closed, so a hidden prompt
# fails fast and loudly instead of hanging forever. Full output always lands in a log
# file, and the path is printed if anything goes wrong.

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

SKIP_CHECKS=0
DRY_RUN=0
LOGS=0
SCOPE="${VERCEL_SCOPE:-}"
LAST_TIMED_OUT=0

while [ $# -gt 0 ]; do
  case "$1" in
    --logs) LOGS=1 ;;
    --skip-checks) SKIP_CHECKS=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --scope) SCOPE="${2:-}"; shift ;;
    --help|-h) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown flag: $1 (try --help)" >&2; exit 2 ;;
  esac
  shift
done

# BSD mktemp only expands XXXXXX at the very end of a template — give it a suffix and
# it creates a file literally named "...XXXXXX.log". So the log gets a timestamped name
# built here, and only OUT, which needs no suffix, goes through mktemp.
LOG="${TMPDIR:-/tmp}/amazon-clone-deploy-$(date +%Y%m%d-%H%M%S).log"
OUT="$(mktemp "${TMPDIR:-/tmp}/amazon-clone-deploy-out.XXXXXX")"
: > "$LOG"
TAIL_PID=""

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
note() { printf '  %s\n' "$1"; }
warn() { printf '  \033[33m%s\033[0m\n' "$1"; }

cleanup() {
  [ -n "$TAIL_PID" ] && kill "$TAIL_PID" 2>/dev/null || true
  rm -f "$OUT"
}
trap cleanup EXIT

die() {
  printf '\n\033[31m✗ %s\033[0m\n' "$1" >&2
  if [ -s "$LOG" ]; then
    printf '\n  Last 40 lines of Vercel output:\n\n' >&2
    tail -n 40 "$LOG" | sed 's/^/    /' >&2
    printf '\n  Full log: %s\n' "$LOG" >&2
  fi
  printf '  Re-run with more detail: npm run deploy -- --logs\n\n' >&2
  exit 1
}

[ "$LOGS" = "1" ] && { tail -f "$LOG" | sed 's/^/  │ /' & TAIL_PID=$!; }

# ------------------------------------------------------------------ vercel calls

vercel_cli() {
  if [ -x node_modules/.bin/vercel ]; then
    node_modules/.bin/vercel "$@"
  else
    npx --yes vercel@latest "$@"
  fi
}

# Runs a Vercel command with a hard timeout.
#
# stdin is closed unless the caller asks for it, because the original version of this
# script hung here: it piped stdout into grep and sent stderr to /dev/null, so when the
# CLI asked a question the prompt was invisible and the script waited on input forever.
# With stdin closed the CLI errors out immediately instead, and the error is in the log.
#
#   vc <timeout-seconds> <closed|open> <vercel args...>
vc() {
  local secs="$1" stdin_mode="$2"; shift 2
  local args=("$@")

  [ -n "$SCOPE" ] && args+=(--scope "$SCOPE")
  [ "$LOGS" = "1" ] && args+=(--debug)

  printf '\n$ vercel %s\n' "${args[*]}" >>"$LOG"
  : > "$OUT"

  if [ "$stdin_mode" = "closed" ]; then
    vercel_cli "${args[@]}" </dev/null >"$OUT" 2>>"$LOG" &
  else
    vercel_cli "${args[@]}" >"$OUT" 2>>"$LOG" &
  fi
  local pid=$!

  # Watchdog. Portable: macOS has no coreutils `timeout` by default.
  (
    sleep "$secs"
    kill -TERM "$pid" 2>/dev/null && \
      echo "[deploy.sh] timed out after ${secs}s: vercel ${args[*]}" >>"$LOG"
  ) 2>/dev/null &
  local watcher=$!

  # Bash announces a killed job on the shell's own stderr ("Terminated: 15"), which
  # reads like a crash. Silence just the reap, then restore stderr.
  local code=0
  exec 3>&2 2>/dev/null
  wait "$pid" || code=$?
  exec 2>&3 3>&-

  kill "$watcher" 2>/dev/null || true
  wait "$watcher" 2>/dev/null || true

  cat "$OUT" >>"$LOG"
  LAST_TIMED_OUT=0
  [ "$code" = "143" ] && LAST_TIMED_OUT=1
  return "$code"
}

# Fails with a message that distinguishes a timeout from an ordinary error, because the
# two need different next steps: a timeout usually means the CLI wanted input.
vc_or_die() {
  local secs="$1" stdin_mode="$2" what="$3"; shift 3
  if vc "$secs" "$stdin_mode" "$@"; then
    return 0
  fi
  if [ "${LAST_TIMED_OUT:-0}" = "1" ]; then
    die "$what timed out after ${secs}s. The CLI was most likely waiting for input — run 'npx vercel $*' once by hand to answer it, then re-run this script."
  fi
  die "$what failed."
}

vc_stdout() { cat "$OUT"; }

# ---------------------------------------------------------------- 1. toolchain

say "Checking toolchain"

command -v node >/dev/null 2>&1 || die "Node is not installed. Install Node 20 or newer."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || die "Node $NODE_MAJOR found; this project needs Node 20 or newer."
note "node $(node -v)"

if [ ! -d node_modules ]; then
  say "Installing dependencies"
  npm install
else
  note "dependencies already installed"
fi

# ------------------------------------------------------------------ 2. the gate

if [ "$SKIP_CHECKS" = "1" ]; then
  note "skipping lint and build (--skip-checks)"
else
  say "Running lint and a production build locally"
  note "this is the gate — a broken build never reaches the live URL"
  npm run lint || die "Lint failed. Fix it, or re-run with --skip-checks."
  npm run build || die "The production build failed locally, so deploying would fail too."
fi

if [ "$DRY_RUN" = "1" ]; then
  say "Dry run"
  note "would: sign in, link the project, set JWT_SECRET and NEXT_PUBLIC_SITE_URL, deploy"
  note "nothing was sent to Vercel"
  printf '\n'
  exit 0
fi

# --------------------------------------------------------- 3. fetch the CLI once

say "Preparing the Vercel CLI"
note "first run downloads it, which can take 30-60 seconds"

vc_or_die 300 closed "Fetching the Vercel CLI" --version
note "vercel $(vc_stdout | tr -d '\n')"

# --------------------------------------------------------------- 4. vercel auth

say "Checking Vercel sign-in"

if vc 60 closed whoami; then
  note "signed in as $(vc_stdout | tr -d '\n')"
else
  note "not signed in — a browser window will open (one time only)"
  # Interactive on purpose: this one needs a terminal and a browser.
  vercel_cli login || die "Sign-in did not complete."
  vc 60 closed whoami || die "Still not signed in after login."
  note "signed in as $(vc_stdout | tr -d '\n')"
fi

# ------------------------------------------------------------- 5. project link

if [ -f .vercel/project.json ]; then
  note "project already linked"
else
  say "Linking this folder to a Vercel project"
  note "a project named after this folder is created if it does not exist"
  vc_or_die 180 closed "Linking the project" link --yes
fi

PROJECT_NAME="amazon-clone"
if [ -f .vercel/project.json ]; then
  PROJECT_NAME="$(node -p "require('./.vercel/project.json').projectName || 'amazon-clone'" 2>/dev/null || echo amazon-clone)"
fi
note "project: $PROJECT_NAME"

# --------------------------------------------------------------- 6. environment

say "Checking environment variables"

# Pulled to a file rather than parsed out of table output: `env ls` formats for humans
# and its layout has changed between CLI versions, while `env pull` is a documented,
# scriptable path. The file lands inside .vercel/, which is git-ignored.
ENV_FILE=".vercel/.env.production.local"
rm -f "$ENV_FILE"

if vc 120 closed env pull "$ENV_FILE" --environment=production --yes; then
  note "read current environment"
else
  warn "could not read the current environment — assuming it is empty"
  : > "$ENV_FILE"
fi

env_has() { [ -f "$ENV_FILE" ] && grep -q "^$1=" "$ENV_FILE"; }

add_env() {
  local name="$1" value="$2" target
  for target in production preview development; do
    # --force makes this idempotent; without it the CLI errors on an existing value.
    if ! printf '%s' "$value" | vc 90 open env add "$name" "$target" --force; then
      die "Could not set $name for $target."
    fi
  done
}

# JWT_SECRET signs the session cookie. Regenerating it would sign everyone out, so it
# is written once and then left alone.
if env_has JWT_SECRET; then
  note "JWT_SECRET already set"
else
  note "generating JWT_SECRET (the value is never printed or committed)"
  if command -v openssl >/dev/null 2>&1; then
    SECRET="$(openssl rand -base64 32)"
  else
    SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
  fi
  add_env JWT_SECRET "$SECRET"
  unset SECRET
  note "JWT_SECRET set"
fi

# ------------------------------------------------------------------- 7. deploy

say "Deploying to production"
note "the build runs on Vercel; expect about a minute"

vc_or_die 900 closed "The deploy" deploy --prod --yes
DEPLOY_URL="$(vc_stdout | tr -d '\n' | tail -c 200)"

[ -n "$DEPLOY_URL" ] || die "Vercel did not return a deployment URL."

# Prefer the stable production alias over the per-deployment URL, which changes every
# time and is useless in a submission.
STABLE_URL="https://${PROJECT_NAME}.vercel.app"
LIVE_URL="$DEPLOY_URL"

if node -e "
  fetch('$STABLE_URL', { redirect: 'manual' })
    .then(r => process.exit(r.status < 500 ? 0 : 1))
    .catch(() => process.exit(1))
" >/dev/null 2>&1; then
  LIVE_URL="$STABLE_URL"
fi

# ------------------------------------------- 8. absolute URLs need a second pass

# NEXT_PUBLIC_* is inlined at build time, so the first build cannot know its own URL.
# Set it once, redeploy once; every later run skips this entirely.
if env_has NEXT_PUBLIC_SITE_URL; then
  note "NEXT_PUBLIC_SITE_URL already set"
else
  say "Recording the live URL for metadata, sitemap and robots"
  note "$LIVE_URL"
  add_env NEXT_PUBLIC_SITE_URL "$LIVE_URL"
  say "Redeploying so absolute URLs are baked in"
  note "this only happens on the first deploy"
  vc_or_die 900 closed "The second deploy" deploy --prod --yes
fi

# --------------------------------------------------------------------- 9. done

say "Verifying the live site"
STATUS="$(node -e "
  fetch('$LIVE_URL').then(r => console.log(r.status)).catch(() => console.log('unreachable'))
")"
note "GET $LIVE_URL -> $STATUS"
[ "$STATUS" = "200" ] || warn "not 200 — inspect with: npx vercel logs $LIVE_URL"

printf '\n\033[32m✓ Live: %s\033[0m\n\n' "$LIVE_URL"
note "Demo sign-in: demo@amazon-clone.dev / demo1234"
note "Deploy again any time with: npm run deploy"
note "Full log: $LOG"
printf '\n'
