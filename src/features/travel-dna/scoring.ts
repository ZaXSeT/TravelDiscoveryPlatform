import type { Destination, Dna, DnaKey, TravelStyle } from "@/types";
import { ALL_DESTINATIONS } from "@/constants/destinations";
import { DNA_QUESTIONS } from "@/features/travel-dna/questions";

// Pure Travel DNA math — shared by the assessment UI, the destination matcher, and the
// itinerary generator (no server-only deps so it can run anywhere).

export const DNA_KEYS: DnaKey[] = [
  "adventure",
  "culture",
  "food",
  "nature",
  "nightlife",
  "budgetFriendly",
];

const DNA_LABEL: Record<DnaKey, string> = {
  adventure: "adventure",
  culture: "culture & history",
  food: "food",
  nature: "nature",
  nightlife: "nightlife",
  budgetFriendly: "value for money",
};

function zeroDna(): Dna {
  return {
    adventure: 0,
    culture: 0,
    food: 0,
    nature: 0,
    nightlife: 0,
    budgetFriendly: 0,
  };
}

const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));

/** Coerce arbitrary JSON (e.g. from the DB) into a valid Dna, or null. */
export function sanitizeDna(input: unknown): Dna | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const dna = zeroDna();
  for (const k of DNA_KEYS) {
    const v = Number(o[k]);
    if (!Number.isFinite(v)) return null;
    dna[k] = clamp(v);
  }
  return dna;
}

/** Stable signature for caching (order-independent of object key order). */
export function dnaSignature(dna: Dna | null): string {
  if (!dna) return "nodna";
  return DNA_KEYS.map((k) => dna[k]).join(",");
}

/** Convert quiz answers (questionId -> chosen option index) into a 0–100 Dna profile. */
export function computeUserDna(answers: Record<string, number>): Dna {
  const sums = zeroDna();
  const max = zeroDna();
  for (const q of DNA_QUESTIONS) {
    // Per-question max achievable per axis (best single option for that axis).
    const perAxisMax = zeroDna();
    for (const opt of q.options) {
      for (const k of Object.keys(opt.weights) as DnaKey[]) {
        const v = opt.weights[k];
        if (v == null) continue;
        if (v > perAxisMax[k]) perAxisMax[k] = v;
      }
    }
    for (const k of DNA_KEYS) max[k] += perAxisMax[k];

    const choice = answers[q.id];
    const opt = choice == null ? undefined : q.options[choice];
    if (opt) {
      for (const k of Object.keys(opt.weights) as DnaKey[]) {
        const v = opt.weights[k];
        if (v == null) continue;
        sums[k] += v;
      }
    }
  }
  const dna = zeroDna();
  for (const k of DNA_KEYS) dna[k] = max[k] > 0 ? clamp((sums[k] / max[k]) * 100) : 0;
  return dna;
}

/**
 * Compatibility 0–100: how well a destination matches a traveler, weighted by what the
 * traveler cares about (their high axes count more). Destinations strong on the axes the
 * user values score higher.
 */
export function compatibilityScore(user: Dna, dest: Dna): number {
  let num = 0;
  let denom = 0;
  for (const k of DNA_KEYS) {
    num += user[k] * dest[k];
    denom += user[k] * 100;
  }
  return denom > 0 ? clamp((num / denom) * 100) : 50;
}

/** Human-readable WHY: the axes where the traveler and destination are both strong. */
export function matchReasons(user: Dna, destination: Destination): string[] {
  return DNA_KEYS.map((k) => ({ k, both: Math.min(user[k], destination.dna[k]) }))
    .filter((x) => x.both >= 40)
    .sort((a, b) => b.both - a.both)
    .slice(0, 3)
    .map(
      (x) =>
        `You're both strong on ${DNA_LABEL[x.k]} — ${destination.name} scores ${destination.dna[x.k]}/100, you ${user[x.k]}/100`,
    );
}

export interface DnaMatch {
  destination: Destination;
  score: number;
  reasons: string[];
}

/** All catalog destinations ranked by compatibility with the user's DNA. */
export function rankDestinations(user: Dna): DnaMatch[] {
  return ALL_DESTINATIONS.map((destination) => ({
    destination,
    score: compatibilityScore(user, destination.dna),
    reasons: matchReasons(user, destination),
  })).sort((a, b) =>
    b.score !== a.score
      ? b.score - a.score
      : a.destination.slug.localeCompare(b.destination.slug),
  );
}

const ARCHETYPES: Record<DnaKey, { title: string; blurb: string }> = {
  adventure: {
    title: "The Thrill Seeker",
    blurb: "You travel for the rush — trails, peaks, and the next adrenaline hit.",
  },
  culture: {
    title: "The Culture Seeker",
    blurb: "Museums, old towns, and living history are what pull you across the map.",
  },
  food: {
    title: "The Flavor Chaser",
    blurb: "You map a city by its markets, kitchens, and late-night street stalls.",
  },
  nature: {
    title: "The Nature Wanderer",
    blurb: "Wide-open landscapes and quiet wilderness are your idea of luxury.",
  },
  nightlife: {
    title: "The Night Owl",
    blurb: "The city comes alive after dark, and so do you.",
  },
  budgetFriendly: {
    title: "The Savvy Explorer",
    blurb: "You go further for less — value-rich trips with nothing wasted.",
  },
};

export function dnaArchetype(user: Dna): { title: string; blurb: string; key: DnaKey } {
  let top: DnaKey = "culture";
  for (const k of DNA_KEYS) if (user[k] > user[top]) top = k;
  return { ...ARCHETYPES[top], key: top };
}

/** Map a DNA profile to the generator's TravelStyle for a sensible default. */
export function dnaToStyle(user: Dna): TravelStyle {
  if (user.budgetFriendly < 35 && (user.food >= 60 || user.nightlife >= 60)) {
    return "luxury";
  }
  const candidates: [TravelStyle, DnaKey][] = [
    ["adventure", "adventure"],
    ["culture", "culture"],
    ["food", "food"],
    ["nature", "nature"],
  ];
  let best = candidates[0]!;
  for (const c of candidates) if (user[c[1]] > user[best[1]]) best = c;
  return best[0];
}
