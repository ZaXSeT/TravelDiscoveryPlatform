import type { NextConfig } from "next";

// Content-Security-Policy listing every origin the app legitimately uses:
// Supabase (auth/storage/realtime), Cloudinary + Unsplash + picsum (images), and
// OpenStreetMap tiles (Leaflet). Now ENFORCED (was Report-Only). NOTE: script-src still
// allows 'unsafe-inline'/'unsafe-eval' (Next.js bootstrap); tightening to per-request
// nonces is a future hardening step (05_SECURITY_AND_RLS.md §8).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // Next.js injects inline bootstrap scripts; tighten to nonces when enforcing.
  // 'unsafe-eval' intentionally omitted — prod doesn't need it (dev re-adds it via Next).
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "worker-src 'self' blob:",
  [
    "img-src 'self' data: blob:",
    "https://res.cloudinary.com",
    "https://*.supabase.co",
    "https://images.unsplash.com",
    "https://plus.unsplash.com",
    "https://picsum.photos",
    "https://fastly.picsum.photos",
    "https://*.tile.openstreetmap.org",
  ].join(" "),
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://res.cloudinary.com https://images.unsplash.com https://plus.unsplash.com",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  // Isolate our browsing context from cross-origin windows (clickjacking/XS-Leaks hardening).
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: csp },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Don't advertise the framework.
  poweredByHeader: false,
  // ESLint is run separately; do not fail production builds on lint style issues.
  eslint: { ignoreDuringBuilds: true },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Production editorial media (D3).
      { protocol: "https", hostname: "res.cloudinary.com" },
      // User uploads served from public Supabase Storage buckets.
      { protocol: "https", hostname: "**.supabase.co" },
      // Dev placeholder behind the image resolver when no Cloudinary cloud is set.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
