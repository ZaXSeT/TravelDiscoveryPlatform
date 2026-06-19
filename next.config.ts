import type { NextConfig } from "next";

// Non-CSP security headers (CSP is tuned in Phase 5 once leaflet/cloudinary/supabase
// origins are finalized — see ProjectDocs/Phase0/05_SECURITY_AND_RLS.md §8).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    ],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
