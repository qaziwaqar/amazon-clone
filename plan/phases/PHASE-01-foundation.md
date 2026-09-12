# Phase 01 — Foundation and first deploy

**Status:** BLOCKED · **Depends on:** 00 · **Budget:** ~40m

## Goal

A Next.js app that builds clean locally **and is live on a public URL**, before a single
feature exists. The deploy pipeline is proven at hour 2, not discovered broken at hour 22.

## Exit criteria

- [x] `npm run build` passes with zero TypeScript errors
- [ ] Public Vercel URL serves the app
- [ ] Pushing to `main` triggers a deploy automatically
- [x] Tailwind, fonts, and the base colour tokens render in both light and dark

## Tasks

- [x] `create-next-app` — TypeScript, Tailwind, App Router, ESLint, `src/`, import alias `@/*`
- [x] Strip boilerplate: default page, unused SVGs, starter CSS
- [x] Design tokens in `globals.css` — Amazon-adjacent palette (squid-ink `#131921`, nav `#232F3E`, accent `#FEBD69`, link `#007185`, price red `#B12704`) as CSS variables, never hard-coded per component
- [x] `src/lib/` skeleton: `db.ts`, `utils.ts` (`cn`, `formatPrice`), `constants.ts`
- [x] Placeholder `/` that renders the token palette, so the deploy is visibly *something*
- [x] `.env.example` with every variable the app will need, no real values
- [ ] Wire git remote to the public GitHub repo **(HUMAN BLOCKER: repo URL)**
- [ ] Import into Vercel, deploy, record the URL in `plan/PROGRESS.md` **(HUMAN BLOCKER: Vercel login)**

## Verify

```bash
npm run build && npm run lint
curl -sSf -o /dev/null -w '%{http_code}\n' "$LIVE_URL"   # 200
```

## Not this phase

Database, schema, seed, any product UI, any auth. Foundation only.

## Notes

Two blocked tasks at the tail. Everything above them runs now; per `LOOP.md` #6 the phase
goes `BLOCKED` only when the loop reaches a blocked task, and the loop then moves on to
Phase 03 (shell), which needs no credentials.
