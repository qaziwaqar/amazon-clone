import { cookies } from "next/headers";
import { DICTIONARIES, LOCALES, LOCALE_META, type Dict, type Locale } from "./dictionaries";
import { CURRENCIES, type Currency } from "./currency";

export const LOCALE_COOKIE = "locale";
export const CURRENCY_COOKIE = "currency";

export type Prefs = { locale: Locale; currency: Currency; dir: "ltr" | "rtl" };

/** Currency a locale defaults to, until the visitor picks one explicitly. */
const DEFAULT_CURRENCY: Record<Locale, Currency> = {
  en: "USD",
  es: "EUR",
  de: "EUR",
  pt: "BRL",
  ar: "AED",
  zh: "CNY",
};

export async function getPrefs(): Promise<Prefs> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  const locale = (LOCALES as readonly string[]).includes(raw ?? "")
    ? (raw as Locale)
    : "en";

  const rawCurrency = store.get(CURRENCY_COOKIE)?.value;
  const currency = (CURRENCIES as readonly string[]).includes(rawCurrency ?? "")
    ? (rawCurrency as Currency)
    : DEFAULT_CURRENCY[locale];

  return { locale, currency, dir: LOCALE_META[locale].dir };
}

export async function getDict(): Promise<Dict> {
  const { locale } = await getPrefs();
  return DICTIONARIES[locale];
}

export { DEFAULT_CURRENCY };
