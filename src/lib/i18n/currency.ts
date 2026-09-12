export const CURRENCIES = ["USD", "EUR", "GBP", "PKR", "AED", "INR", "BRL", "CNY"] as const;
export type Currency = (typeof CURRENCIES)[number];

/**
 * Fixed demo rates against USD.
 *
 * Deliberately not live. A storefront that silently reprices itself between a product
 * page and a checkout because a rate moved is worse than one that is honestly static,
 * and the picker says these are demo rates. Prices are stored as integer USD cents;
 * conversion happens only at render.
 */
export const RATES: Record<Currency, { rate: number; label: string }> = {
  USD: { rate: 1, label: "US Dollar" },
  EUR: { rate: 0.92, label: "Euro" },
  GBP: { rate: 0.79, label: "British Pound" },
  PKR: { rate: 278, label: "Pakistani Rupee" },
  AED: { rate: 3.67, label: "UAE Dirham" },
  INR: { rate: 83.2, label: "Indian Rupee" },
  BRL: { rate: 5.43, label: "Brazilian Real" },
  CNY: { rate: 7.24, label: "Chinese Yuan" },
};

/** Currencies whose smallest unit is the whole unit — no decimal places. */
const ZERO_DECIMAL: Currency[] = ["PKR", "INR"];

export function convert(usdCents: number, currency: Currency): number {
  return usdCents * RATES[currency].rate;
}

export function formatMoney(
  usdCents: number,
  currency: Currency,
  locale: string,
): string {
  const value = convert(usdCents, currency) / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: ZERO_DECIMAL.includes(currency) ? 0 : 2,
  }).format(value);
}

/** Split for the superscript-cents treatment, in the target currency. */
export function splitMoney(
  usdCents: number,
  currency: Currency,
  locale: string,
): { symbol: string; whole: string; fraction: string } {
  const value = convert(usdCents, currency) / 100;
  const zero = ZERO_DECIMAL.includes(currency);

  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: zero ? 0 : 2,
    minimumFractionDigits: zero ? 0 : 2,
  }).formatToParts(value);

  const symbol = parts.filter((p) => p.type === "currency").map((p) => p.value).join("");
  const whole = parts
    .filter((p) => p.type === "integer" || p.type === "group")
    .map((p) => p.value)
    .join("");
  const fraction = parts.find((p) => p.type === "fraction")?.value ?? "";

  return { symbol, whole, fraction };
}
