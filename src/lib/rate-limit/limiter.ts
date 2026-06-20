import "server-only";
import { headers } from "next/headers";

// Fail-open rate limiter (05_SECURITY_AND_RLS.md §5). Uses Upstash Redis REST when
// configured; otherwise a best-effort in-memory window (per-process — fine for dev/demo).
// On any error it allows the request (availability over strictness for non-critical paths).

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

interface Bucket {
  count: number;
  reset: number;
}
const memory = new Map<string, Bucket>();

function memoryAllow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = memory.get(key);
  if (!bucket || now > bucket.reset) {
    memory.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

/** Returns true if the action is allowed under the limit. */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<boolean> {
  if (upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${upstashToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", key],
          ["EXPIRE", key, String(windowSeconds), "NX"],
        ]),
        cache: "no-store",
      });
      if (!res.ok) return true; // fail open
      const data = (await res.json()) as Array<{ result: number }>;
      const count = data?.[0]?.result ?? 0;
      return count <= limit;
    } catch {
      return true; // fail open
    }
  }
  return memoryAllow(key, limit, windowSeconds * 1000);
}

/** Build a client-scoped key from the request IP. */
export async function clientRateKey(scope: string): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for") ?? "";
  const ip = fwd.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  return `rl:${scope}:${ip}`;
}
