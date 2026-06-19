import type { MetadataRoute } from "next";
import { siteConfig } from "@/constants/config";
import { DESTINATION_SLUGS } from "@/constants/destinations";
import { routes } from "@/constants/routes";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [routes.home, routes.explore].map(
    (path) => ({ url: `${base}${path}`, lastModified: now }),
  );

  const destinationRoutes: MetadataRoute.Sitemap = DESTINATION_SLUGS.map(
    (slug) => ({ url: `${base}${routes.destination(slug)}`, lastModified: now }),
  );

  return [...staticRoutes, ...destinationRoutes];
}
