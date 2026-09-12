import { splitPrice } from "@/lib/utils";

/** Amazon renders the cents as a superscript. It is a big part of why a price "reads" right. */
export function Price({
  cents,
  size = "md",
  className = "",
}: {
  cents: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { whole, fraction } = splitPrice(cents);
  const main =
    size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base";
  const sup = size === "lg" ? "text-sm" : "text-xs";

  return (
    <span className={`inline-flex items-start leading-none ${className}`}>
      <span className={`${sup} mt-0.5`}>$</span>
      <span className={`${main} font-medium`}>{whole}</span>
      <span className={`${sup} mt-0.5`}>{fraction}</span>
    </span>
  );
}

export function ListPrice({ cents }: { cents: number }) {
  const { whole, fraction } = splitPrice(cents);
  return (
    <span className="text-xs text-muted">
      List: <span className="line-through">${whole}.{fraction}</span>
    </span>
  );
}
