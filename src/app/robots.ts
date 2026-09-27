import type { MetadataRoute } from "next";
import { retreat } from "@/config/retreat";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      ...(retreat.indexable ? { allow: "/" } : { disallow: "/" }),
    },
  };
}
