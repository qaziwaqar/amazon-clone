"use client";

import { createContext, useContext } from "react";
import type { Dict, Locale } from "@/lib/i18n/dictionaries";
import type { Currency } from "@/lib/i18n/currency";

type Ctx = { locale: Locale; currency: Currency; dict: Dict };

const LocaleContext = createContext<Ctx | null>(null);

/**
 * Seeded once by the server layout from cookies, so every client component — product
 * cards inside rails, the cart controls, the price display — formats money and reads
 * strings without each one hitting cookies or prop-drilling through five levels.
 */
export function LocaleProvider({ value, children }: { value: Ctx; children: React.ReactNode }) {
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used inside LocaleProvider");
  return ctx;
}
