import "server-only";
import type { GeneratedTrip } from "@/features/trip-generator/types";

// Best-effort in-memory itinerary cache (per server process). Identical inputs return a
// cached plan instead of re-invoking Gemini - controls cost + latency and guarantees the
// AI is never called repeatedly for the same request within the TTL.

interface Entry {
  trip: GeneratedTrip;
  expires: number;
}

const TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_ENTRIES = 300;
const store = new Map<string, Entry>();

export function cacheKey(parts: (string | number | null)[]): string {
  return parts.map((p) => String(p)).join("|");
}

export function getCached(key: string): GeneratedTrip | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    store.delete(key);
    return null;
  }
  // Refresh LRU position.
  store.delete(key);
  store.set(key, entry);
  return entry.trip;
}

export function setCached(key: string, trip: GeneratedTrip): void {
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest !== undefined) store.delete(oldest);
  }
  store.set(key, { trip, expires: Date.now() + TTL_MS });
}
