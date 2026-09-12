# Phase 08 — Auth

**Status:** TODO · **Depends on:** 02, 07 · **Budget:** ~50m

## Goal

Own email + password auth. No vendor, no bill. Plus a one-click demo login, because a
grader has five minutes and should never hit a signup wall.

## Exit criteria

- [ ] Sign up, sign in, sign out all work end to end
- [ ] Password hashed with bcrypt (cost ≥ 10); plaintext never stored or logged
- [ ] Session is a JWT in an httpOnly, Secure, SameSite=Lax cookie
- [ ] Protected routes redirect to sign-in and return to the original destination after
- [ ] **Demo login** button fills valid credentials and signs in with one click
- [ ] Guest cart merges on sign-in (Phase 07 path, exercised here)

## Tasks

- [ ] `src/lib/auth.ts` — hash, verify, sign JWT, read session, `requireUser()`
- [ ] `/signin` and `/signup` pages in Amazon's narrow-card layout with the logo above
- [ ] Server actions with real field-level validation and real error messages
- [ ] Demo account seeded with order history, so `/orders` is not empty on first look
- [ ] Prominent "Use demo account" button on `/signin`
- [ ] Middleware guarding `/orders`, `/account`, `/checkout`, with `?next=` return
- [ ] Account menu: signed-out prompt vs signed-in name + menu
- [ ] Sign-out clears the cookie and revalidates the header

## Verify

```bash
npm run build
# manual: demo login -> lands signed in, header shows name, /orders populated
# manual: sign out -> protected route bounces to /signin?next=...
```

## Not this phase

OAuth providers, password reset email, 2FA, email verification. All need a mail vendor;
none change the shopping experience being judged.

## Security notes

Generic "email or password is incorrect" on failure — never reveal which. Rate-limit
sign-in attempts per IP. `JWT_SECRET` from env, no fallback default in code.
