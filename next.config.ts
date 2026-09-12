import type { NextConfig } from "next";

/**
 * Security-relevant configuration. See SECURITY.md for the reasoning behind each
 * decision and for what is deliberately left out.
 */
const nextConfig: NextConfig = {
  images: {
    /*
     * Image optimization is OFF for this deployment, on purpose.
     *
     * `/_next/image` is a server-side fetch-and-re-encode endpoint. With a remote
     * host allowed, anyone can request `/_next/image?url=<allowed-host>/<anything>&w=…`
     * and each distinct (url, width, quality) triple is a cache miss that costs a
     * fetch plus a transform on our account. The source host here serves an unbounded
     * set of URLs, so the reachable key space is unbounded too — an open, billable
     * proxy on a free tier, and free tiers respond to overuse by suspending the
     * project. That is a denial of service someone else can trigger.
     *
     * The images are third-party stock photos already served at a sensible size, so
     * optimizing them buys little. Turning it off removes the endpoint from the attack
     * surface completely rather than trying to bound it.
     */
    unoptimized: true,

    // Kept as a statement of intent: if optimization is ever turned back on, these are
    // the only hosts allowed, and only on the paths the catalogue actually generates.
    remotePatterns: [
      { protocol: "https", hostname: "loremflickr.com", pathname: "/700/700/**" },
      { protocol: "https", hostname: "*.staticflickr.com" },
    ],
  },

  // Vercel and most hosts send a Server header; there is no reason to advertise the
  // framework version on top of it.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Stop MIME sniffing turning a text response into executable content.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No framing: there is no legitimate reason to embed a storefront, and it
          // closes clickjacking against the add-to-cart and checkout buttons.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Do not leak the full URL — which carries search terms — to third parties.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Geolocation is used, but only by this origin and only on a click. Camera,
          // microphone and payment APIs are never used, so they are denied outright.
          {
            key: "Permissions-Policy",
            value: "geolocation=(self), camera=(), microphone=(), payment=(), usb=()",
          },
          // Enforced by the host on HTTPS; stated here so it survives a move.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
