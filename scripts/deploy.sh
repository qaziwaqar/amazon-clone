#!/usr/bin/env bash
#
# One-command deploy to Vercel, straight from this machine.
#
#   npm run deploy
#
# No git remote, no GitHub, no CI. The script is idempotent: run it as often as you
# like and it only does the work that is still outstanding.
#
# Flags:
#   --skip-checks   skip lint and the local build gate (faster, riskier)
#   --dry-run       print what would happen without touching Vercel
#   --help

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

SKIP_CHECKS=0
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --skip-checks) SKIP_CHECKS=1 ;;
    --dry-run) DRY_RUN=1 ;;
    --help|-h) sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "Unknown flag: $arg (try --help)" >&2; exit 2 ;;
  esac
done

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$1"; }
note() { printf '  %s\n' "$1"; }
die()  { printf '\n\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

# Wraps every Vercel call so --dry-run is honoured in one place.
vercel_run() {
  if [ "$DRY_RUN" = "1" ]; then
    printf '  [dry-run] npx vercel %s\n' "$*"
    return 0
  fi
  npx --yes vercel@latest "$@"
}

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
  npm run lint
  npm run build
fi

# --------------------------------------------------------------- 3. vercel auth

say "Checking Vercel sign-in"

if [ "$DRY_RUN" = "1" ]; then
  note "[dry-run] would verify sign-in, logging in via browser if needed"
elif npx --yes vercel@latest whoami >/dev/null 2>&1; then
  note "signed in as $(npx --yes vercel@latest whoami 2>/dev/null)"
else
  note "not signed in — a browser window will open (one time only)"
  npx --yes vercel@latest login
fi

# ------------------------------------------------------------- 4. project link

if [ -f .vercel/project.json ] || [ "$DRY_RUN" = "1" ]; then
  [ "$DRY_RUN" = "1" ] && note "[dry-run] would link the project if needed" \
                       || note "project already linked"
else
  say "Linking this folder to a Vercel project"
  note "accepting the defaults creates a project named after this folder"
  vercel_run link --yes
fi

PROJECT_NAME="amazon-clone"
if [ -f .vercel/project.json ]; then
  PROJECT_NAME="$(node -p "require('./.vercel/project.json').projectName || 'amazon-clone'" 2>/dev/null || echo amazon-clone)"
fi

# --------------------------------------------------------------- 5. environment

say "Checking environment variables"

env_has() {
  if [ "$DRY_RUN" = "1" ]; then
    note "[dry-run] would check whether $1 is set, and add it if not"
    return 0
  fi
  npx --yes vercel@latest env ls production 2>/dev/null | grep -q "^ *$1 "
}

# JWT_SECRET signs the session cookie. Without it the app still runs, but every
# deploy invalidates existing sessions, so it is set once and left alone.
if env_has JWT_SECRET; then
  [ "$DRY_RUN" = "1" ] || note "JWT_SECRET already set"
else
  say "Generating JWT_SECRET"
  if command -v openssl >/dev/null 2>&1; then
    SECRET="$(openssl rand -base64 32)"
  else
    SECRET="$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")"
  fi
  note "generated; the value is never printed or committed"
  if [ "$DRY_RUN" = "1" ]; then
    note "[dry-run] would add JWT_SECRET to production, preview and development"
  else
    for target in production preview development; do
      printf '%s' "$SECRET" | npx --yes vercel@latest env add JWT_SECRET "$target" >/dev/null
    done
  fi
  unset SECRET
fi

# ------------------------------------------------------------------ 6. deploy

say "Deploying to production"
note "the build runs on Vercel; this takes about a minute the first time"

if [ "$DRY_RUN" = "1" ]; then
  note "[dry-run] would run: npx vercel deploy --prod --yes"
  DEPLOY_URL="https://${PROJECT_NAME}.vercel.app"
else
  DEPLOY_URL="$(npx --yes vercel@latest deploy --prod --yes)"
fi

[ -n "$DEPLOY_URL" ] || die "Vercel did not return a deployment URL."

# Vercel also aliases production to a stable <project>.vercel.app. Prefer that over the
# per-deployment URL, which changes on every deploy and is useless in a submission.
STABLE_URL="https://${PROJECT_NAME}.vercel.app"
LIVE_URL="$DEPLOY_URL"

if [ "$DRY_RUN" != "1" ]; then
  if node -e "
    fetch('$STABLE_URL', { redirect: 'manual' })
      .then(r => process.exit(r.status < 500 ? 0 : 1))
      .catch(() => process.exit(1))
  " >/dev/null 2>&1; then
    LIVE_URL="$STABLE_URL"
  fi
fi

# ------------------------------------------- 7. absolute URLs need a second pass

# NEXT_PUBLIC_* is inlined at build time, so the first build cannot know its own URL.
# Set it once, redeploy once, and every later run skips this entirely.
if env_has NEXT_PUBLIC_SITE_URL; then
  [ "$DRY_RUN" = "1" ] || note "NEXT_PUBLIC_SITE_URL already set"
else
  say "Recording the live URL for metadata, sitemap and robots"
  note "$LIVE_URL"
  if [ "$DRY_RUN" = "1" ]; then
    note "[dry-run] would set NEXT_PUBLIC_SITE_URL and redeploy once"
  else
    for target in production preview development; do
      printf '%s' "$LIVE_URL" | npx --yes vercel@latest env add NEXT_PUBLIC_SITE_URL "$target" >/dev/null
    done
    say "Redeploying so absolute URLs are baked in"
    note "this only happens on the first deploy"
    npx --yes vercel@latest deploy --prod --yes >/dev/null
  fi
fi

# --------------------------------------------------------------------- 8. done

if [ "$DRY_RUN" != "1" ]; then
  say "Verifying the live site"
  STATUS="$(node -e "
    fetch('$LIVE_URL').then(r => console.log(r.status)).catch(() => console.log('unreachable'))
  ")"
  note "GET $LIVE_URL -> $STATUS"
  [ "$STATUS" = "200" ] || note "if that is not 200, check: npx vercel logs $LIVE_URL"
fi

printf '\n\033[32m✓ Live: %s\033[0m\n\n' "$LIVE_URL"
note "Demo sign-in: demo@amazon-clone.dev / demo1234"
note "Deploy again any time with: npm run deploy"
printf '\n'
