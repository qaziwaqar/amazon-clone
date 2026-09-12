import { splitPrice } from "@/lib/utils";

/**
 * Deploy canary.
 *
 * Phase 01 exists to prove the pipeline works before any feature does, so this
 * page's only job is to be visibly, verifiably *something* on the live URL. It
 * renders the design tokens, which means a broken Tailwind build or a missing
 * font shows up here rather than three phases later. Phase 04 replaces it.
 */

const CHROME = [
  ["--color-squid", "squid", "top nav"],
  ["--color-nav", "nav", "department strip"],
  ["--color-footer", "footer", "footer base"],
] as const;

const ACTION = [
  ["--color-accent", "accent", "search button"],
  ["--color-cta", "cta", "add to cart"],
  ["--color-buy", "buy", "buy now"],
] as const;

const SEMANTIC = [
  ["--color-price", "price", "price red"],
  ["--color-link", "link", "link teal"],
  ["--color-success", "success", "in stock"],
  ["--color-star", "star", "rating star"],
] as const;

function Swatch({ token, name, use }: { token: string; name: string; use: string }) {
  return (
    <div className="overflow-hidden rounded border border-line bg-surface">
      <div className="h-16" style={{ background: `var(${token})` }} />
      <div className="px-3 py-2">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted">{use}</div>
      </div>
    </div>
  );
}

function Group({
  title,
  items,
}: {
  title: string;
  items: readonly (readonly [string, string, string])[];
}) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(([token, name, use]) => (
          <Swatch key={token} token={token} name={name} use={use} />
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const { whole, fraction } = splitPrice(2499);

  return (
    <main id="main" className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="rounded bg-squid px-5 py-4 text-white">
        <h1 className="text-xl font-bold">Foundation deployed</h1>
        <p className="mt-1 text-sm text-white/70">
          Phase 01 of 12. Pipeline is live before any feature exists — a deploy that
          breaks at hour 22 is the thing that actually sinks a build like this.
        </p>
      </div>

      <Group title="Chrome" items={CHROME} />
      <Group title="Actions" items={ACTION} />
      <Group title="Semantic" items={SEMANTIC} />

      <section className="mt-10 rounded border border-line bg-surface p-5">
        <h2 className="mb-4 text-lg font-bold">Primitives</h2>

        <div className="flex flex-wrap items-center gap-4">
          <span className="text-price">
            <span className="align-super text-xs">$</span>
            <span className="text-2xl font-medium">{whole}</span>
            <span className="align-super text-xs">{fraction}</span>
          </span>

          <button
            type="button"
            className="rounded-full border border-cta-border bg-cta px-5 py-1.5 text-sm hover:bg-cta-hover"
          >
            Add to Cart
          </button>

          <button
            type="button"
            className="rounded-full border border-buy-border bg-buy px-5 py-1.5 text-sm hover:bg-buy-hover"
          >
            Buy Now
          </button>

          <a href="#main" className="text-sm text-link hover:text-link-hover hover:underline">
            A link, in Amazon teal
          </a>

          <span className="text-sm text-success">In Stock</span>
        </div>
      </section>

      <p className="mt-8 text-xs text-muted">
        Next up: Phase 02 — Drizzle schema and a ~600 product seed. Blocked on a Neon
        connection string. See <code>plan/PROGRESS.md</code>.
      </p>
    </main>
  );
}
