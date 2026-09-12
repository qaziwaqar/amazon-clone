import type { Product, Review } from "@/lib/data/types";
import { StarRating } from "@/components/star-rating";

export function Reviews({ product, reviews }: { product: Product; reviews: Review[] }) {
  const histogram = [5, 4, 3, 2, 1].map((star) => {
    const n = reviews.filter((r) => r.rating === star).length;
    return { star, pct: reviews.length ? Math.round((n / reviews.length) * 100) : 0 };
  });

  return (
    <section id="reviews" className="scroll-mt-32 bg-surface p-5">
      <h2 className="text-xl font-bold">Customer reviews</h2>

      <div className="mt-4 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <StarRating rating={product.rating} size="md" />
            <span className="text-base">{product.rating.toFixed(1)} out of 5</span>
          </div>
          <p className="mt-1 text-sm text-muted">
            {product.reviewCount.toLocaleString()} global ratings
          </p>

          <ul className="mt-4 space-y-1.5">
            {histogram.map((h) => (
              <li key={h.star} className="flex items-center gap-2 text-sm">
                <span className="w-12 shrink-0 text-link">{h.star} star</span>
                <span className="h-5 flex-1 overflow-hidden rounded-sm border border-line bg-surface-sunken">
                  <span
                    className="block h-full bg-star"
                    style={{ width: `${h.pct}%` }}
                    aria-hidden
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-muted">{h.pct}%</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-muted">
            Reviews in this rebuild are generated sample data. Writing a review is out of
            scope — moderation is a different product from shopping.
          </p>
        </div>

        <div>
          <h3 className="text-base font-bold">Top reviews</h3>
          <ul className="mt-3 space-y-6">
            {reviews.map((r) => (
              <li key={r.id}>
                <p className="text-sm font-bold">{r.author}</p>
                <div className="mt-1 flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <span className="text-sm font-bold">{r.title}</span>
                </div>
                <p className="mt-1 text-xs text-muted">
                  Reviewed on {r.date}
                  {r.verified && (
                    <span className="ml-2 font-bold text-[#c45500]">Verified Purchase</span>
                  )}
                </p>
                <p className="mt-2 text-sm">{r.body}</p>
                <p className="mt-2 text-xs text-muted">
                  {r.helpful} people found this helpful
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
