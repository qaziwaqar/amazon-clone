import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Catalogue images are keyword-matched stock photos, pinned per product so the
    // catalogue is identical on every machine. They are stand-ins, not real product
    // photography, and the README says so. ProductImage falls back to a generated
    // tile if the host is unreachable, so a listing never renders as a broken image.
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com" },
      { protocol: "https", hostname: "*.staticflickr.com" },
    ],
  },
};

export default nextConfig;
