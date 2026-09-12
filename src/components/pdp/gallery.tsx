"use client";

import { ProductImage } from "@/components/product-image";
import { useState } from "react";

/**
 * Thumbnail rail plus a lens zoom on pointer devices. Touch devices get plain
 * swiping through the thumbnails instead — a hover zoom on a touchscreen is a trap.
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="flex gap-3">
      <div className="hidden w-12 shrink-0 flex-col gap-2 sm:flex">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1} of ${images.length}`}
            aria-current={i === active}
            className={`relative aspect-square overflow-hidden rounded border ${
              i === active ? "border-link ring-1 ring-link" : "border-line"
            }`}
          >
            <ProductImage src={src} alt="" sizes="48px" className="object-cover" />
          </button>
        ))}
      </div>

      <div
        className="relative aspect-square min-w-0 flex-1 overflow-hidden bg-surface"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setLens({
            x: ((e.clientX - r.left) / r.width) * 100,
            y: ((e.clientY - r.top) / r.height) * 100,
          });
        }}
        onMouseLeave={() => setLens(null)}
      >
        <ProductImage
          src={images[active]}
          alt={title}
          priority
          sizes="(max-width: 1024px) 100vw, 500px"
          className="object-contain transition-transform duration-150"
          style={
            lens
              ? { transform: "scale(1.9)", transformOrigin: `${lens.x}% ${lens.y}%` }
              : undefined
          }
        />
      </div>

      {/* Mobile: dots under the image, since the thumbnail rail is hidden. */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5 sm:hidden">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Image ${i + 1}`}
            className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-ink" : "bg-ink/30"}`}
          />
        ))}
      </div>
    </div>
  );
}
