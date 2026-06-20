import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep auth + per-user pages out of the index.
      disallow: ["/auth/", "/wishlist", "/itineraries", "/profile", "/journal/new"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
