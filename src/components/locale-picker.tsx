"use client";

import { useEffect, useState, useTransition } from "react";
import { setLocalePrefs } from "@/app/actions/locale";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/dictionaries";
import { CURRENCIES, RATES, type Currency } from "@/lib/i18n/currency";
import { useLocale } from "./locale-provider";
import { ChevronIcon } from "./icons";

/**
 * Language and currency. Both take effect immediately across the whole site: the
 * dictionary swaps, prices reformat in the chosen currency, and Arabic flips the
 * document to RTL.
 */
export function LocalePicker() {
  const { locale, currency, dict } = useLocale();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [showCurrency, setShowCurrency] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const apply = (nextLocale: Locale, nextCurrency: Currency) =>
    start(async () => {
      await setLocalePrefs(nextLocale, nextCurrency);
      setOpen(false);
    });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex shrink-0 items-center gap-1 rounded-sm border border-transparent px-2 py-1.5 text-sm font-bold hover:border-white"
      >
        <span aria-hidden className="text-base leading-none">
          {LOCALE_META[locale].flag}
        </span>
        {LOCALE_META[locale].code}
        <ChevronIcon className="h-3 w-3 rotate-90" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden />
          <div
            role="dialog"
            aria-label={dict.changeLanguage}
            className="absolute end-0 z-50 mt-2 w-72 rounded bg-surface p-4 text-ink shadow-lg"
          >
            <h2 className="text-base font-bold">{dict.changeLanguage}</h2>

            <ul className="mt-2">
              {LOCALES.map((code) => (
                <li key={code}>
                  <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm hover:bg-surface-sunken">
                    <input
                      type="radio"
                      name="locale"
                      checked={locale === code}
                      disabled={pending}
                      onChange={() => apply(code, currency)}
                    />
                    <span>
                      {LOCALE_META[code].label} – {LOCALE_META[code].code}
                    </span>
                  </label>
                </li>
              ))}
            </ul>

            <p className="mt-2 border-t border-line pt-2 text-xs text-muted">
              {dict.translationNote}
            </p>

            <h2 className="mt-3 border-t border-line pt-3 text-base font-bold">
              {dict.changeCurrency}
            </h2>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span>
                {currency} – {RATES[currency].label}
              </span>
              <button
                type="button"
                onClick={() => setShowCurrency((v) => !v)}
                className="text-link hover:text-link-hover hover:underline"
              >
                {showCurrency ? dict.close : "Change"}
              </button>
            </div>

            {showCurrency && (
              <ul className="mt-2 max-h-44 overflow-y-auto">
                {CURRENCIES.map((code) => (
                  <li key={code}>
                    <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1.5 text-sm hover:bg-surface-sunken">
                      <input
                        type="radio"
                        name="currency"
                        checked={currency === code}
                        disabled={pending}
                        onChange={() => apply(locale, code)}
                      />
                      <span>
                        {code} – {RATES[code].label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-2 text-xs text-muted">{dict.ratesNote}</p>

            <p className="mt-3 border-t border-line pt-3 text-sm">
              <span aria-hidden>🇺🇸</span> {dict.shoppingOn}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
