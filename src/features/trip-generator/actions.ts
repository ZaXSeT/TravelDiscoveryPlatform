"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthedContext,
  destinationIdForSlug,
} from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import {
  generateTrip,
  resolveDestination,
} from "@/features/trip-generator/engine";
import {
  generateTripWithGemini,
  isGeminiConfigured,
} from "@/features/trip-generator/ai/gemini";
import {
  cacheKey,
  getCached,
  setCached,
} from "@/features/trip-generator/cache";
import { rateLimit, clientRateKey } from "@/lib/rate-limit/limiter";
import { sanitizeDna, dnaSignature } from "@/features/travel-dna/scoring";
import type { GeneratedTrip, TripInput } from "@/features/trip-generator/types";
import type { ActionResult, Dna, TravelStyle } from "@/types";
import { routes } from "@/constants/routes";

const STYLES: readonly string[] = [
  "adventure",
  "culture",
  "food",
  "nature",
  "luxury",
];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function normalize(input: TripInput): TripInput {
  return {
    budget: Math.min(5_000_000, Math.max(20_000, Math.round(input.budget || 0))),
    days: Math.min(14, Math.max(1, Math.round(input.days || 7))),
    style: (STYLES.includes(input.style) ? input.style : "culture") as TravelStyle,
    destinationSlug: input.destinationSlug || null,
  };
}

// Gate the (paid) Gemini call. The plan feature is free to users, so the owner bears the
// API cost - both tiers are capped to prevent spam. Over the limit, the caller falls back
// to the free deterministic engine (the user still gets a valid itinerary).
async function canUseGemini(userId?: string): Promise<boolean> {
  if (userId) {
    // Accounts: small burst guard + a bounded daily cap.
    if (!(await rateLimit(`rl:trip-gen:u:${userId}:min`, 5, 60))) return false; // 5 / minute
    return rateLimit(`rl:trip-gen:u:${userId}:day`, 10, 86_400); // 10 / day per account
  }
  // Guests: a hard daily cap (per IP) so anonymous users can try but can't spam.
  const ipKey = await clientRateKey("trip-gen");
  return rateLimit(`${ipKey}:day`, 3, 86_400); // 3 / day per IP
}

// Generation entry point. Order of operations:
//   1. Load the user's saved Travel DNA (personalization).
//   2. Resolve the destination from our catalog (source of truth).
//   3. Return a cached plan for identical inputs (never re-call Gemini).
//   4. Within the per-user cooldown, call Gemini (User DNA + Destination DNA + grounding).
//   5. On rate-limit / quota / error, fall back to the deterministic engine.
// The user always receives a valid itinerary. Runs server-side so the key stays hidden.
export async function generateTripAction(
  input: TripInput,
  opts?: { bypassCache?: boolean },
): Promise<GeneratedTrip> {
  const safe = normalize(input);

  try {
    const { supabase, user } = await getAuthedContext();
    let userDna: Dna | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("travel_dna")
      .eq("id", user.id)
      .maybeSingle();
    userDna = sanitizeDna(data?.travel_dna);
  }

  const destination = resolveDestination(safe, userDna);

  const key = cacheKey([
    safe.budget,
    safe.days,
    safe.style,
    destination.slug,
    dnaSignature(userDna),
  ]);
  // "Regenerate" passes bypassCache to force a fresh AI variation; normal generation
  // returns the cached plan for identical inputs (anti-spam).
  if (!opts?.bypassCache) {
    const cached = getCached(key);
    if (cached) return cached;
  }

  let fallbackReason: "rate_limited" | "unavailable" = "unavailable";
  if (isGeminiConfigured()) {
    if (await canUseGemini(user?.id)) {
      try {
        const trip = await generateTripWithGemini(safe, destination, userDna);
        setCached(key, trip);
        return trip;
      } catch (e) {
        // 503 / timeout / quota / parse error -> fall back (logged for diagnosis)
        console.warn(
          "[trip-generator] Gemini failed -> offline planner:",
          e instanceof Error ? e.message : e,
        );
      }
    } else {
      fallbackReason = "rate_limited";
      console.warn("[trip-generator] rate limit reached -> offline planner");
    }
  } else {
    console.warn("[trip-generator] GEMINI_API_KEY not set -> offline planner");
  }

    const fallback = generateTrip(safe, destination);
    fallback.fallbackReason = fallbackReason;
    // Don't cache a rate-limited result — once the limit resets we want a fresh AI try.
    if (fallbackReason !== "rate_limited") setCached(key, fallback);
    return fallback;
  } catch {
    // Last resort: pure deterministic plan with no auth/DB/network dependency, so the
    // user ALWAYS receives a valid itinerary (never "couldn't generate").
    const destination = resolveDestination(safe, null);
    return generateTrip(safe, destination);
  }
}

// Persists an already-generated trip (Gemini output isn't deterministic, so we save the
// produced plan rather than re-running). RLS scopes everything to the owner.
export async function saveTrip(
  trip: GeneratedTrip,
): Promise<ActionResult<{ id: string }>> {
  if (
    !trip?.destinationName ||
    !Array.isArray(trip.itinerary) ||
    trip.itinerary.length === 0
  ) {
    return fail("validation", "Nothing to save yet.");
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in to save this trip.");

  const destinationId = trip.destinationSlug
    ? await destinationIdForSlug(supabase, trip.destinationSlug)
    : null;

  const { data: itin, error } = await supabase
    .from("itineraries")
    .insert({
      user_id: user.id,
      title: `${trip.days} days in ${trip.destinationName}`.slice(0, 120),
      destination_id: destinationId,
      source: "generated",
      style: trip.style,
      total_budget: Math.max(0, Math.round(trip.budget?.total ?? 0)),
    })
    .select("id")
    .single();
  if (error || !itin) return fail("server_error", "Could not save the trip.");

  for (const [di, day] of trip.itinerary.slice(0, 14).entries()) {
    const { data: dayRow } = await supabase
      .from("itinerary_days")
      .insert({
        itinerary_id: itin.id,
        day_index: di + 1,
        // Theme only — the planner already labels each day "Day N"; strip any leading "Day N".
        title: (day.title ?? "")
          .replace(/^\s*day\s*\d+\s*[:·\-–—.]*\s*/i, "")
          .trim()
          .slice(0, 120),
      })
      .select("id")
      .single();
    if (!dayRow) continue;

    const items = (day.items ?? []).slice(0, 12).map((it, i) => ({
      day_id: dayRow.id,
      position: i,
      title: (it.title ?? "Activity").slice(0, 160),
      start_time:
        it.startTime && TIME_RE.test(it.startTime) ? it.startTime : null,
      cost: Math.max(0, Math.round(it.cost ?? 0)),
      note: (it.description ?? it.note ?? null)?.toString().slice(0, 500) ?? null,
    }));
    if (items.length > 0) {
      await supabase.from("itinerary_items").insert(items);
    }
  }

  revalidatePath(routes.itineraries);
  revalidatePath(routes.profile);
  return ok({ id: itin.id });
}
