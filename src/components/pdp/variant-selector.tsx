"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Variant } from "@/lib/data/types";
import { formatPrice } from "@/lib/utils";

/**
 * Variant lives in the URL so the selection survives a reload and can be linked to.
 * Unavailable combinations are disabled rather than hidden — hiding them makes the
 * list change size as you click, which reads as a bug.
 */
export function VariantSelector({
  variants,
  selected,
  basePrice,
}: {
  variants: Variant[];
  selected?: string;
  basePrice: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  if (variants.length === 0) return null;

  const kind = variants[0].kind;

  const choose = (id: string) => {
    const next = new URLSearchParams(params.toString());
    next.set("v", id);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <fieldset className="mt-4">
      <legend className="text-sm font-bold">
        {kind === "color" ? "Colour" : "Size"}:{" "}
        <span className="font-normal">
          {variants.find((v) => v.id === selected)?.label ?? "Select"}
        </span>
      </legend>

      <div className="mt-2 flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSelected = v.id === selected;
          return (
            <button
              key={v.id}
              type="button"
              disabled={!v.available}
              onClick={() => choose(v.id)}
              aria-pressed={isSelected}
              title={v.available ? v.label : `${v.label} — unavailable`}
              className={`rounded border px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${
                isSelected ? "border-link ring-2 ring-link" : "border-line hover:border-muted"
              }`}
            >
              {kind === "color" && (
                <span
                  aria-hidden
                  className="mr-2 inline-block h-3.5 w-3.5 rounded-full border border-line align-middle"
                  style={{ background: v.swatch }}
                />
              )}
              {v.label}
              {v.priceDelta > 0 && (
                <span className="ml-2 text-xs text-muted">
                  +{formatPrice(v.priceDelta)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-muted">
        Price shown is for the selected option ({formatPrice(basePrice)} base).
      </p>
    </fieldset>
  );
}
