import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/config";
import { ALL_DESTINATION_SLUGS } from "@/constants/destinations";
import { routes } from "@/constants/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    routes.home,
    routes.explore,
    routes.journal,
  ].map((path) => ({ url: `${base}${path}`, lastModified: now }));

  // Every destination detail page (Tier 1 + Tier 2).
  const destinationRoutes: MetadataRoute.Sitemap = ALL_DESTINATION_SLUGS.map(
    (slug) => ({
      url: `${base}${routes.destination(slug)}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...destinationRoutes];
}
