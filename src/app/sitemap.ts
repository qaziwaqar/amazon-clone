import type { MetadataRoute } from "next";
import { allProducts, DEPARTMENTS } from "@/lib/data/catalogue";
import { SITE_URL } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: SITE_URL, lastModified: now, priority: 1 },
    ...DEPARTMENTS.map((d) => ({
      url: `${SITE_URL}/s?i=${d.slug}`,
      lastModified: now,
      priority: 0.8,
    })),
    ...allProducts().map((p) => ({
      url: `${SITE_URL}/dp/${p.slug}`,
      lastModified: now,
      priority: 0.6,
    })),
  ];
}
