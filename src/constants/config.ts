// Centralized tunables and feature flags (no magic numbers in components).

export const siteConfig = {
  name: "GO",
  title: "GO — Travel Discovery",
  description:
    "Discover destinations, hidden gems, and plan trips worth taking. A cinematic travel discovery platform.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "en",
  currency: "USD",
} as const;

export const featureFlags = {
  // Phase 2 ships the static globe; the interactive WebGL globe is a Phase 4 enhancement.
  interactiveGlobe: false,
  // Hero video is desktop-only and enabled in Phase 4; Phase 2 uses a static poster.
  heroVideo: false,
} as const;

export const limits = {
  uploadMaxBytes: 5 * 1024 * 1024, // 5 MB (enforced for user uploads, Phase 3)
  uploadMimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  tripDaysMax: 14,
  tripDaysMin: 1,
} as const;
