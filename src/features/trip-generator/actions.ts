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

  if (isGeminiConfigured()) {
    const limiterKey = user
      ? `rl:trip-gen:u:${user.id}`
      : await clientRateKey("trip-gen");
    const allowed = await rateLimit(limiterKey, 10, 60); // 10 AI generations / minute
    if (allowed) {
      try {
        const trip = await generateTripWithGemini(safe, destination, userDna);
        setCached(key, trip);
        return trip;
      } catch {
        // quota exceeded / error -> deterministic fallback below
      }
    }
  }

  const fallback = generateTrip(safe, destination);
  setCached(key, fallback);
  return fallback;
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
        title: (day.title ?? `Day ${di + 1}`).slice(0, 120),
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
