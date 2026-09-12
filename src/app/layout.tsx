import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/constants";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { LocaleProvider } from "@/components/locale-provider";
import { getPrefs } from "@/lib/i18n/server";
import { DICTIONARIES } from "@/lib/i18n/dictionaries";

// Amazon Ember is not licensed for redistribution. Inter is the closest free face
// at the same optical size and keeps the header rhythm intact.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: ${SITE_TAGLINE}`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_TAGLINE,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, currency, dir } = await getPrefs();

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to main content
        </a>
        <LocaleProvider value={{ locale, currency, dict: DICTIONARIES[locale] }}>
          <Header />
          {children}
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}
