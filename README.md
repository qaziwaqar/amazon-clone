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

Browsing, search and the cart are open to everyone. **Checkout requires an account**,
as on the real site — the cart is kept while you sign in.

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

## 3. Deploy

One command, from this machine. No git remote, no GitHub, no CI.

```bash
npm run deploy
```

That is the whole thing. The script is idempotent — run it again any time to ship an
update, and it skips whatever is already done.

### What it does

1. Checks Node 20+ and installs dependencies if they are missing.
2. **Runs lint and a production build locally.** This is a gate: a build that fails here
   never reaches the live URL.
3. Signs you in to Vercel if needed — a browser opens, once, the first time.
4. Links the folder to a Vercel project, accepting defaults.
5. Generates `JWT_SECRET` and pushes it to Vercel. The value is never printed or
   committed.
6. Deploys to production.
7. Records the live URL as `NEXT_PUBLIC_SITE_URL` and redeploys once, so metadata,
   `sitemap.xml` and `robots.txt` carry absolute URLs. First run only —
   `NEXT_PUBLIC_*` is inlined at build time, so the first build cannot know its own URL.
8. Fetches the live URL and reports the status code.

Then it prints the link.

### Before the first run

Only one thing: a free Vercel account at <https://vercel.com/signup>. No card, no paid
tier, nothing to configure. The script handles sign-in from there.

### Flags

```bash
npm run deploy:logs               # stream everything Vercel prints, plus debug output
npm run deploy -- --skip-checks   # skip lint and the local build (faster, riskier)
npm run deploy -- --scope my-team # deploy under a Vercel team, not your personal account
npm run deploy:check              # dry run: print every step, touch nothing
bash scripts/deploy.sh --help
```

### If it hangs or fails

Every Vercel call runs with a timeout and with **stdin closed**, so a prompt from the
CLI fails fast instead of blocking forever, and the script says which command stalled
and what to do about it.

All Vercel output — including stderr — is written to a log file whose path is printed
on failure and at the end of a successful run. Nothing is silently discarded.

| Symptom | What to do |
|---|---|
| A step stalls, then reports a timeout | The CLI wanted input. The message names the command — run it once by hand (`npx vercel <command>`), answer the prompt, then re-run `npm run deploy`. |
| You want to watch it work | `npm run deploy:logs` |
| You belong to a Vercel team | `npm run deploy -- --scope <team-slug>`, or set `VERCEL_SCOPE` |
| Something looks wrong on the live site | `npx vercel logs <your-url>` |

Re-running is always safe. The script only does what is still outstanding.

### Why Vercel

It is the only free host where this project deploys with no adapter and no workarounds:
Next.js 16 App Router, server actions, middleware and image optimization all work as
built, and `vercel deploy` ships straight from a local folder with no git repository.

The runners-up, for the record:

| Host | Verdict |
|---|---|
| Netlify | Works, via `@netlify/plugin-nextjs`. One more moving part for no gain. |
| Cloudflare Workers | Needs the OpenNext adapter; middleware and image optimization need care. |
| Render | Free tier sleeps after inactivity. A 50-second cold start makes the site look broken to anyone opening the link. |
| Railway / Fly | Require a card on file. |

### Deploying by hand instead

If you would rather not run a script: push the repo to GitHub, import it at
<https://vercel.com/new>, keep every default, and add `JWT_SECRET` under Environment
Variables. After the first deploy, add `NEXT_PUBLIC_SITE_URL` set to the URL Vercel
gave you and redeploy.

### Any other Node host

It is a stock Next.js app with no native dependencies:

```bash
npm run build && npm start     # binds to $PORT, default 3000
```

Two environment variables, both optional, both described in §2.

## 4. What is built

| Route | What is there |
|---|---|
| `/` | Hero carousel, category tiles, deals, best-seller and browsing rails |
| Header | "All" department drawer (full department list lives here), delivery-location picker with optional GPS, language and currency picker |
| `/deals` | Genuinely discounted stock, deepest discount first |
| `/coupons` | Savings of 20%+, grouped by department |
| `/gift-cards` | Gift cards as real catalogue items — they add to the cart and check out normally |
| `/browsing-history` | Products you opened, with a clear-history control |
| `/buy-again` | Everything ordered before, de-duplicated. Requires sign-in |
| `/help` | Customer service: plain answers about what is real here and what is simulated |
| `/s` | Search with department, price, rating, brand and Prime facets; five sorts; pagination |
| `/dp/[slug]` | Gallery with lens zoom, variants, buy box, specs, reviews with histogram, related items |
| `/cart` | Quantity, remove, save for later, free-shipping progress |
| `/signin`, `/signup` | Email + password, one-click demo login |
| `/checkout` | **Requires sign-in.** Address, delivery speed, simulated payment, order review — no field is pre-filled |
| `/orders`, `/orders/[id]` | Order history, delivery progress, buy again |
| `/account` | Account hub |

600 products across 8 departments, plus gift cards, generated deterministically — the
same catalogue on every machine and every deploy, so deep links do not rot.

### Language and currency

The flag control in the header switches both, and both take effect site-wide:

- **Six languages** — English, español, Deutsch, português, العربية, 中文. Arabic
  switches the document to right-to-left, including the carousel and rail controls.
- **Eight currencies** — USD, EUR, GBP, PKR, AED, INR, BRL, CNY. Every price on the
  site reprices, including the cart, checkout totals and order history. Currencies with
  no minor unit (PKR, INR) drop the decimals rather than printing `.00`.

Two deliberate limits, both stated in the picker itself:

- **The interface is translated; product listings are not.** A seller's title stays as
  the seller wrote it, which is how the real site behaves.
- **Conversion uses fixed demo rates, not live ones.** A storefront that silently
  reprices between the product page and checkout because a rate moved is worse than one
  that is honestly static.

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
- **There is no guest checkout**, matching amazon.com. `/checkout`, `/orders` and
  `/account` are gated in middleware, re-verified on the page, and — because a server
  action is a public endpoint in its own right — inside the order-placement action too.
- **Cart and orders live in httpOnly cookies.** They survive reloads and redeploys.
  Orders are capped at the six most recent.
- **Checkout pre-fills nothing**, including the card field. Any Luhn-valid test number
  works, for example 4242 4242 4242 4242.

### Deliberately not built

Named as product decisions, not gaps: Seller Central, Prime Video/Music, real payment
rails, ML recommendations (the "also viewed" rail is a stated heuristic), i18n, writing
reviews, returns and refunds, carrier tracking. The header nav omits Prime Video,
Registry and Sell for the same reason — a link to a page that does nothing is worse
than no link.

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
