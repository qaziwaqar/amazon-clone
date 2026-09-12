"use client";

import { splitMoney, formatMoney } from "@/lib/i18n/currency";
import { useLocale } from "./locale-provider";

/**
 * Prices are stored as integer USD cents and converted at render, never in storage.
 * The superscript-cents treatment is a big part of why an Amazon price "reads" right,
 * and it survives the currency switch — including currencies with no minor unit,
 * where the fraction is simply absent rather than rendered as "00".
 */
export function Price({
  cents,
  size = "md",
  className = "",
}: {
  cents: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { currency, locale } = useLocale();
  const { symbol, whole, fraction } = splitMoney(cents, currency, locale);

  const main = size === "lg" ? "text-3xl" : size === "md" ? "text-xl" : "text-base";
  const sup = size === "lg" ? "text-sm" : "text-xs";

  return (
    <span className={`inline-flex items-start leading-none ${className}`}>
      <span className={`${sup} mt-0.5`}>{symbol}</span>
      <span className={`${main} font-medium`}>{whole}</span>
      {fraction && <span className={`${sup} mt-0.5`}>{fraction}</span>}
    </span>
  );
}

export function ListPrice({ cents }: { cents: number }) {
  const { currency, locale } = useLocale();
  return (
    <span className="text-xs text-muted">
      List: <span className="line-through">{formatMoney(cents, currency, locale)}</span>
    </span>
  );
}

/** Plain formatted amount, for totals and summary rows. */
export function Money({ cents }: { cents: number }) {
  const { currency, locale } = useLocale();
  return <>{formatMoney(cents, currency, locale)}</>;
}
