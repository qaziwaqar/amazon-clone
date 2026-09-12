# Amazon rebuild

A working storefront rebuilt from amazon.com: browse, search, filter, add to cart, sign
in, check out, and track the order afterwards. Next.js 16, TypeScript, Tailwind v4.

**Runs with zero setup.** No database, no API keys, no accounts. Clone, install, run.

---

## 1. Run it locally

```bash
git clone <repo-url>
cd amazon-clone
npm install
npm run dev
```

Open <http://localhost:3000>.

Requires Node 20 or newer.

**Sign in with the demo account** — there is a one-click button on `/signin`, or type:

| | |
|---|---|
| Email | `demo@amazon-clone.dev` |
| Password | `demo1234` |

The demo account has order history already populated.

---

## 2. Configuration

Nothing is required to run. All three variables are optional.

```bash
cp .env.example .env.local   # then edit
```

| Variable | Required | What it does |
|---|---|---|
| `JWT_SECRET` | Production only | Signs the session cookie. If unset, a random key is generated at boot and sessions do not survive a restart. Generate one with `openssl rand -base64 32`. |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute origin for metadata, `sitemap.xml` and `robots.txt`. Defaults to `http://localhost:3000`. |
| `DATABASE_URL` | No | Unused today. Present for the Postgres upgrade path described in §6. |

### Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build (runs TypeScript) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

---

## 3. Deploy to Vercel

Free tier, no card.

1. Push the repo to GitHub (public).
2. Go to <https://vercel.com/new> and import the repo.
3. Leave every build setting on its default — Next.js is detected automatically.
4. Open **Environment Variables** and add `JWT_SECRET` (from `openssl rand -base64 32`).
   Skip this and sign-in still works, but sessions drop on redeploys.
5. Click **Deploy**. First build takes about a minute.
6. After the first deploy, add `NEXT_PUBLIC_SITE_URL` set to the URL Vercel gave you,
   then redeploy so metadata and the sitemap use absolute URLs.

Every push to `main` redeploys automatically.

### Deploying anywhere else

Any host that runs a Node server works — it is a stock Next.js app with no native
dependencies:

```bash
npm run build && npm start     # binds to $PORT, default 3000
```

Netlify and Render both work with the same two environment variables. Avoid free tiers
that sleep after inactivity: a 50-second cold start makes the site look broken.

---

## 4. What is built

| Route | What is there |
|---|---|
| `/` | Hero carousel, category tiles, deals, best-seller and browsing rails |
| Header | "All" department drawer, delivery-location picker with optional GPS |
| `/s` | Search with department, price, rating, brand and Prime facets; five sorts; pagination |
| `/dp/[slug]` | Gallery with lens zoom, variants, buy box, specs, reviews with histogram, related items |
| `/cart` | Quantity, remove, save for later, free-shipping progress |
| `/signin`, `/signup` | Email + password, one-click demo login |
| `/checkout` | Address, delivery speed, simulated payment, order review — no field is pre-filled |
| `/orders`, `/orders/[id]` | Order history, delivery progress, buy again |
| `/account` | Account hub |

600 products across 8 departments, generated deterministically — the same catalogue on
every machine and every deploy, so deep links do not rot.

---

## 5. What is mocked, and why

Stated plainly rather than buried:

- **Catalogue data is generated, not scraped.** Titles, brands, specs and prices are
  built from per-department vocabularies. Reviews are generated with a realistic
  J-shaped rating distribution.
- **Product images are keyword-matched stock photos** from `loremflickr.com` — a hair
  dryer listing pulls hair-dryer photography, a tent pulls tents. Each slot is pinned
  with a `lock` seed so the catalogue looks identical on every machine and across
  deploys. They are stand-ins, not real product photography. If the host is unreachable
  the page renders a generated tile from the product title rather than a broken image.
- **Payment is simulated.** The card number is Luhn-checked for typos and discarded.
  Nothing is charged, stored or transmitted.
- **Accounts live in server memory.** Sign-up works and signs you in immediately, but
  accounts do not survive a restart. The demo account is always present.
- **Cart and orders live in httpOnly cookies.** They survive reloads and redeploys.
  Orders are capped at the six most recent.
- **Checkout pre-fills nothing**, including the card field. Any Luhn-valid test number
  works, for example 4242 4242 4242 4242.

### Deliberately not built

Named as product decisions, not gaps: Seller Central, Prime Video/Music, real payment
rails, ML recommendations (the "also viewed" rail is a stated heuristic), i18n, writing
reviews, returns and refunds, carrier tracking.

---

## 6. Delivery location and GPS

The "Deliver to" control in the header opens a picker with two ways to set a location:

- **Use my current location** — asks the browser for permission on click, never on page
  load. Coordinates are resolved to a place name *in the browser* via BigDataCloud's
  keyless reverse-geocode endpoint, and only that name and postal code are sent to the
  server. Latitude and longitude never reach the server or its logs.
- **Enter a ZIP code** — the fallback, and what is offered if permission is denied, the
  lookup fails, or the browser has no geolocation.

The choice is stored in an httpOnly cookie for 180 days. No API key, no account.

Geolocation requires a secure context: it works on `localhost` and on any HTTPS
deployment, and is unavailable over plain HTTP on a remote host.

## 7. Upgrading to Postgres

The UI never touches the dataset directly. Everything goes through `src/lib/queries/*`,
which is the seam:

1. Add Drizzle and a `DATABASE_URL` (Neon's free tier needs no card).
2. Port the types in `src/lib/data/types.ts` to a schema.
3. Reimplement the functions in `src/lib/queries/products.ts` as SQL.
4. Swap `src/lib/cart.ts` and `src/lib/orders.ts` from cookies to tables.

No component changes. Search scoring already weights title over brand over description,
matching what a Postgres `tsvector` would do, so result ordering stays stable.

---

## 8. Repository layout

```
src/app/          routes, server actions, middleware
src/components/   UI, grouped by surface (pdp/, cart/, search/, auth/…)
src/lib/data/     catalogue generator and types
src/lib/queries/  the data seam every page reads through
plan/             phase plan, loop contract, progress ledger
.agent-logs/      raw prompt/response capture for every session
CAPTURE-TEST.md   proof the capture hook works
```

`plan/LOOP.md` holds the build rules, including the two that shaped this repo: no
half-built surface ships, and a missing credential never blocks a feature.
