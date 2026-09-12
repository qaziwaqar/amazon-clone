import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Catalogue images are seeded placeholders from a public host, deterministic per
    // product id. They are not real product photography and the README says so —
    // guessing at a retailer's CDN paths produces broken images, which look worse.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
    ],
  },
};

export default nextConfig;
