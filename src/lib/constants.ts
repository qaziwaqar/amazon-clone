export const SITE_NAME = "Amazon";
export const SITE_TAGLINE =
  "Online Shopping for Electronics, Apparel, Computers, Books, DVDs & more";

/** Free-shipping threshold, in cents. Drives the cart progress bar in Phase 07. */
export const FREE_SHIPPING_THRESHOLD = 3500;

/** Results per search page. Amazon uses 16-24 depending on layout; 24 grids cleanly. */
export const PAGE_SIZE = 24;

/** Recently-viewed cookie cap. */
export const RECENTLY_VIEWED_MAX = 20;

export const CART_COOKIE = "cart_token";
export const SESSION_COOKIE = "session";

/** Absolute origin, used for metadata, sitemap and robots. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
