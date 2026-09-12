"use client";

import { useRouter } from "next/navigation";
import type { SearchParamsShape, SortKey } from "@/lib/queries/products";
import { buildUrl } from "@/lib/search-params";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Avg. Customer Review" },
  { value: "newest", label: "Newest Arrivals" },
];

export function SortSelect({ params }: { params: SearchParamsShape }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-muted">Sort by:</span>
      <select
        value={params.sort ?? "featured"}
        onChange={(e) => router.push(buildUrl(params, { sort: e.target.value as SortKey }))}
        className="rounded border border-line bg-surface-sunken px-2 py-1 text-sm"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
