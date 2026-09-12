import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Cart, checkout and account are per-session and have nothing to index.
      { userAgent: "*", allow: "/", disallow: ["/cart", "/checkout", "/account", "/orders"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
