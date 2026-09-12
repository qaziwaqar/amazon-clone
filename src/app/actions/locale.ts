"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";
import { CURRENCIES, type Currency } from "@/lib/i18n/currency";
import { CURRENCY_COOKIE, DEFAULT_CURRENCY, LOCALE_COOKIE } from "@/lib/i18n/server";

const YEAR = 60 * 60 * 24 * 365;

export async function setLocalePrefs(locale: string, currency: string) {
  if (!(LOCALES as readonly string[]).includes(locale)) return { ok: false as const };
  if (!(CURRENCIES as readonly string[]).includes(currency)) return { ok: false as const };

  const store = await cookies();
  const opts = {
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: YEAR,
  };

  // Readable by the client too — the picker shows the current selection before any
  // round trip, and there is nothing sensitive in a language choice.
  store.set(LOCALE_COOKIE, locale, opts);
  store.set(CURRENCY_COOKIE, currency, opts);

  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function setLocale(locale: Locale) {
  return setLocalePrefs(locale, DEFAULT_CURRENCY[locale]);
}

export async function setCurrency(currency: Currency) {
  const store = await cookies();
  const locale = store.get(LOCALE_COOKIE)?.value ?? "en";
  return setLocalePrefs(locale, currency);
}
