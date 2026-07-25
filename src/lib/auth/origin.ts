import "server-only";
import { headers } from "next/headers";
import { siteConfig } from "@/constants/config";

function normalize(value: string): string {
  return value.replace(/\/+$/, "");
}

// The origin auth emails should link back to.
//
// NEXT_PUBLIC_SITE_URL is inlined at build time, so it silently stays at its localhost
// default whenever it is not set in the deployment environment — which mails recipients a
// link to *their own* machine. Vercel's own runtime vars cover that case without a rebuild.
//
// Order matters for safety: the trusted, operator-controlled sources are checked first and
// the request's Host header last, so a forged Host cannot rewrite a production email link
// (host-header injection). Supabase's Redirect URL allow-list is the backstop.
export async function authEmailOrigin(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && !/^https?:\/\/(localhost|127\.0\.0\.1)/i.test(configured)) {
    return normalize(configured);
  }

  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercelHost) return `https://${normalize(vercelHost)}`;

  // Local dev and tunnels: trust the request so the link returns to the host actually used.
  const h = await headers();
  const host = (h.get("x-forwarded-host") ?? h.get("host"))
    ?.split(",")[0]
    ?.trim();
  if (host) {
    const proto =
      h.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
      (/^(localhost|127\.0\.0\.1)(:|$)/i.test(host) ? "http" : "https");
    return `${proto}://${host}`;
  }

  return normalize(siteConfig.url);
}
