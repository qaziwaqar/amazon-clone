"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Product image with a generated fallback.
 *
 * Catalogue photography comes from a third-party host. If that host is slow, blocked
 * or gone, a listing must still look like a listing — so a failed load renders a
 * deterministic tile built from the product title rather than a broken-image icon.
 */
export function ProductImage({
  src,
  alt,
  sizes,
  className = "",
  priority = false,
  style,
}: {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) return <FallbackTile alt={alt} className={className} />;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

function FallbackTile({ alt, className }: { alt: string; className?: string }) {
  let h = 0;
  for (let i = 0; i < alt.length; i++) h = (h * 31 + alt.charCodeAt(i)) % 360;

  const initials = alt
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  return (
    <div
      role="img"
      aria-label={alt}
      className={`absolute inset-0 grid place-items-center ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${h} 45% 92%), hsl(${(h + 40) % 360} 45% 84%))` }}
    >
      <span className="text-2xl font-bold" style={{ color: `hsl(${h} 40% 35%)` }}>
        {initials || "?"}
      </span>
    </div>
  );
}
