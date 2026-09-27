import type { NextConfig } from "next";
import { retreat } from "./src/config/retreat";
const config: NextConfig = {
  poweredByHeader: false,
  images: { qualities: [75, 85] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          ...(retreat.indexable
            ? []
            : [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]),
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
export default config;
