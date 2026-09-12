# Security notes

What was checked, what was changed, and what is deliberately still open. This is a
public demo on a free tier, so two things matter: no secret should ever reach the
repository, and no anonymous visitor should be able to spend our money or our CPU.

---

## Secrets

**Nothing sensitive is committed.** Verified against the working tree *and* the full
history, since a secret removed in a later commit is still a secret in the repository.

Checked for: private keys, AWS access keys, GitHub tokens (`ghp_`, `github_pat_`),
OpenAI and Stripe keys, Slack tokens, Google API keys, JWTs, and database connection
strings with embedded credentials — across every blob ever committed, and across
`.agent-logs/`, which ships with the repo and is the most likely place for a pasted
credential to end up.

Two deliberate exceptions, neither a secret:

| Value | Why it is fine |
|---|---|
| `.env.example` contains `postgresql://user:password@ep-xxx-pooler…` | Literal placeholders. There is no such host and no such credential. |
| `demo@amazon-clone.dev` / `demo1234` in source and README | The demo account is meant to be public — it exists so a reviewer never meets a signup wall. It holds generated order history and nothing else. |

### How secrets are kept out

- `.gitignore` covers `.env`, `.env*.local`, `.env*` and `.vercel/`, with an explicit
  `!.env.example` so the template still ships.
- `JWT_SECRET` has **no hard-coded fallback**. A default secret in source is the same
  as no secret at all. When it is unset the process generates a random key at boot and
  warns; sessions then do not survive a restart, which is the correct failure mode.
- The deploy script generates `JWT_SECRET` and pushes it to Vercel without ever
  printing or committing the value.
- `vercel env pull` writes into `.vercel/`, which is git-ignored.

---

## Resource-abuse hardening

A free tier answers overuse by suspending the project, so anything an anonymous caller
can make expensive is a denial of service someone else can trigger. Three were found
and closed.

### 1. The image optimizer was an open, billable proxy — closed

`/_next/image` fetches and re-encodes a remote image server-side. With a remote host
allowed, anyone could request `/_next/image?url=<allowed-host>/<anything>&w=…&q=…`,
and every distinct `(url, width, quality)` triple is a cache miss costing one fetch and
one transform **on our account**. The image host serves an unbounded set of URLs, so
the reachable key space was unbounded too.

Optimization is now **off** (`images.unoptimized`). The images are third-party stock
photos already served at a sensible size, so optimizing them bought little, and turning
it off removes the endpoint from the attack surface entirely instead of trying to bound
it. `remotePatterns` is kept, narrowed to the exact path the catalogue generates, as a
statement of intent if it is ever turned back on.

Verified: `/_next/image?url=…` returns **404**, and pages carry zero `/_next/image` URLs.

### 2. Search CPU amplification — bounded

The did-you-mean suggestion rebuilt a vocabulary over the whole catalogue on **every
zero-result query**, then ran a similarity comparison per term against it. Searching
for something that does not exist is free for the sender and expensive for us, and
query length was the only limit.

The vocabulary is now built once per process, and both the search and the suggestion
path cap a query at **8 terms**, so the work one request can buy is bounded.

### 3. Password hashing as a DoS lever — rate limited

`scrypt` is deliberately slow, which is right for storing passwords and wrong as
something an anonymous caller can trigger in a loop — on a serverless host, CPU time
is the bill. Sign-in, sign-up and demo sign-in are limited to **10 attempts per IP per
5 minutes**, checked *before* the hash runs.

Verified: the 11th attempt is refused.

**Stated limitation:** the counters live in process memory, so each serverless instance
keeps its own and a distributed attacker sees a higher effective limit. This raises the
cost of an attack; it does not make one impossible. A deployment needing a real
guarantee moves the counters to a shared store — Vercel KV, Upstash, or the database —
and `src/lib/rate-limit.ts` keeps the same interface.

---

## Application security

| Area | Position |
|---|---|
| **Session** | HMAC-signed, `httpOnly`, `SameSite=Lax`, `Secure` in production. Signature verified server-side on every protected page. |
| **Middleware vs. pages** | Middleware only checks that a cookie *exists* — it runs on the edge without the signing key. Every protected page re-verifies with `getUser()`, so a forged cookie gets past middleware and no further. |
| **Server actions** | Treated as public endpoints. `placeOrder` checks authentication itself; gating the page that renders a form proves nothing about who can POST to it. |
| **Order authorization** | Orders are read scoped to the signed-in user. Another user's id returns **404, not 403** — a 403 confirms the record exists. |
| **User enumeration** | Sign-in failures are generic ("email or password is incorrect"). An unknown email used to skip the hash and answer measurably faster, which is a timing oracle; it is now hashed against a decoy so both paths do the same work. |
| **Password storage** | `scrypt` with a per-user random salt, compared in constant time. |
| **Price integrity** | Every line is re-read and re-priced from the catalogue inside the placement action. A client-sent price, quantity or total is ignored entirely. |
| **Open redirect** | `?next=` is accepted only when it starts with a single `/`, so `//evil.com` is rejected. |
| **Card data** | Validated for shape and discarded. Never stored, never logged, never transmitted. |
| **Location data** | Coordinates are resolved to a place name **in the browser**; only the name and postal code reach the server. Latitude and longitude are never sent or logged. |
| **Cookie bounds** | Cart 50 lines, orders 6, browsing history 20, location label 40 chars, query 120 chars. A corrupt cookie degrades to empty rather than throwing. |
| **Headers** | `nosniff`, `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `strict-origin-when-cross-origin`, HSTS, and a `Permissions-Policy` allowing geolocation only to this origin while denying camera, microphone, payment and USB. `X-Powered-By` removed. |

---

## Deliberately not done

- **A full Content-Security-Policy.** Only `frame-ancestors` is set. A real
  script-src policy needs per-request nonces threaded through the framework's inline
  bootstrap; done carelessly it either breaks the app or ends in `unsafe-inline`, which
  is a policy in name only. Worth doing properly, not worth faking.
- **CSRF tokens.** Next.js server actions verify the `Origin` header against the host,
  and session cookies are `SameSite=Lax`. Adding a token layer on top would be
  redundant here.
- **Account lockout.** Rate limiting is per IP, not per account, precisely so that
  someone cannot lock another person out by guessing at their email.
- **Secret scanning in CI.** There is no CI — deploys run from a local machine by
  design. The scan documented above is a manual gate before a push.

## If you find something

Open an issue on the repository. This is a demo with no real users, no real payments
and no personal data, so there is nothing here to disclose responsibly — but the
finding is still welcome.
