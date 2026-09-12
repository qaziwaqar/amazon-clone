/**
 * Half-star accurate. The visible stars are decorative; the numeric value goes in an
 * aria-label so a screen reader gets "4.3 out of 5 stars" rather than five graphics.
 */
export function StarRating({
  rating,
  size = "sm",
  className = "",
}: {
  rating: number;
  size?: "sm" | "md";
  className?: string;
}) {
  const px = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));

  return (
    <span
      className={`inline-flex items-center ${className}`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      <span className="relative inline-block">
        <span className="flex text-line" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={px} />
          ))}
        </span>
        <span
          className="absolute inset-0 flex overflow-hidden text-star"
          style={{ width: `${pct}%` }}
          aria-hidden
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className={`${px} shrink-0`} />
          ))}
        </span>
      </span>
    </span>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="m12 17.3-6.2 3.7 1.7-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.5 4.8 1.7 7z" />
    </svg>
  );
}
