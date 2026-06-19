// Single source of truth for media references (07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md).
// Values are Cloudinary public IDs. The image resolver (lib/cloudinary/url.ts) turns
// them into delivery URLs, or into deterministic dev placeholders when no Cloudinary
// cloud is configured. No hardcoded URLs anywhere else in the app.

export type DestinationImageKind =
  | "hero"
  | "thumbnail"
  | "videoPoster"
  | "gallery-1"
  | "gallery-2"
  | "gallery-3"
  | "gallery-4";

export const destinationImageId = (
  slug: string,
  kind: DestinationImageKind,
): string => `go/destinations/${slug}/${kind}`;

export const galleryIds = (slug: string): string[] => [
  destinationImageId(slug, "gallery-1"),
  destinationImageId(slug, "gallery-2"),
  destinationImageId(slug, "gallery-3"),
  destinationImageId(slug, "gallery-4"),
];

export const brandAssets = {
  ogFallback: "go/brand/og-default",
  globeStill: "go/brand/globe-still",
} as const;
