import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prices are stored as integer cents everywhere. Floats do not survive a tax
 * calculation, and a storefront that is a penny out looks broken.
 */
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/** Amazon renders the cents as a superscript. Split so the markup can too. */
export function splitPrice(cents: number): { whole: string; fraction: string } {
  const whole = Math.floor(cents / 100).toLocaleString("en-US");
  const fraction = String(cents % 100).padStart(2, "0");
  return { whole, fraction };
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
