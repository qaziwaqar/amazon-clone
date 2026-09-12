import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Catalogue images are hotlinked from a remote CDN rather than stored, so the
    // free tier never touches object storage or egress billing. Phase 02 picks the
    // final source; both are whitelisted so the seed can switch without a redeploy.
    remotePatterns: [
      { protocol: "https", hostname: "m.media-amazon.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
