import type { Destination, Dna, DnaKey, TravelStyle } from "@/types";
import { ALL_DESTINATIONS } from "@/constants/destinations";
import { compatibilityScore } from "@/features/travel-dna/scoring";
import type {
  GeneratedDay,
  GeneratedItem,
  GeneratedTrip,
  TripInput,
} from "@/features/trip-generator/types";

// =============================================================================
// Rule-based, DETERMINISTIC trip engine (D4 — no LLM). Same input -> same output, so the
// server can re-run it at save time for integrity. Selection uses Travel DNA; days are
// filled from the destination's gems/nearby + style activity templates.
// Works over the 5 featured (DB-backed) destinations so saved trips have a valid FK.
// =============================================================================

// style -> primary/secondary DNA axes for scoring
const STYLE_AXES: Record<TravelStyle, { primary: DnaKey; secondary: DnaKey }> = {
  adventure: { primary: "adventure", secondary: "nature" },
  culture: { primary: "culture", secondary: "food" },
  food: { primary: "food", secondary: "culture" },
  nature: { primary: "nature", secondary: "adventure" },
  luxury: { primary: "culture", secondary: "food" }, // + inverse budgetFriendly below
};

interface ActivityTemplate {
  title: string;
  startTime: string;
  cost: number;
}

const STYLE_ACTIVITIES: Record<TravelStyle, ActivityTemplate[]> = {
  adventure: [
    { title: "Sunrise hike to a viewpoint", startTime: "06:30", cost: 0 },
    { title: "Kayaking or water sports", startTime: "10:00", cost: 4000 },
    { title: "Cliffside lookout at golden hour", startTime: "16:30", cost: 0 },
  ],
  culture: [
    { title: "Old-town walking tour", startTime: "09:30", cost: 1500 },
    { title: "Museums & galleries", startTime: "13:00", cost: 2500 },
    { title: "Evening at a historic landmark", startTime: "18:30", cost: 0 },
  ],
  food: [
    { title: "Local street-food crawl", startTime: "11:00", cost: 2000 },
    { title: "Hands-on cooking class", startTime: "15:00", cost: 5000 },
    { title: "Dinner at a renowned spot", startTime: "19:30", cost: 4000 },
  ],
  nature: [
    { title: "National park or reserve", startTime: "08:00", cost: 1500 },
    { title: "Scenic viewpoint picnic", startTime: "12:30", cost: 0 },
    { title: "Lakeside or coastal walk", startTime: "16:30", cost: 0 },
  ],
  luxury: [
    { title: "Spa & wellness morning", startTime: "10:00", cost: 8000 },
    { title: "Private guided experience", startTime: "14:00", cost: 9000 },
    { title: "Fine-dining tasting menu", startTime: "20:00", cost: 12000 },
  ],
};

function seedFrom(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic small offset around the city centre so map markers spread out (~a few km).
function jitter(
  c: { lat: number; lng: number },
  n: number,
): { lat: number; lng: number } {
  const a = ((n * 9301 + 49297) % 233280) / 233280;
  const b = ((n * 4096 + 150889) % 233280) / 233280;
  return { lat: c.lat + (a - 0.5) * 0.06, lng: c.lng + (b - 0.5) * 0.06 };
}

function scoreDestination(d: Destination, style: TravelStyle): number {
  const axes = STYLE_AXES[style];
  let affinity =
    0.6 * d.dna[axes.primary] + 0.4 * d.dna[axes.secondary];
  if (style === "luxury") {
    // Luxury favors pricier/less budget-friendly places.
    affinity = 0.5 * (100 - d.dna.budgetFriendly) + 0.3 * d.dna.culture + 0.2 * d.dna.food;
  }
  return affinity;
}

// Destination data is the source of truth: resolve the trip's destination from our
// catalog — the user's explicit pick, else the best match for their saved Travel DNA, else
// their chosen style. Shared by both the Gemini path and the deterministic fallback so they
// target the same place.
export function resolveDestination(
  input: TripInput,
  userDna?: Dna | null,
): Destination {
  if (input.destinationSlug) {
    const preferred = ALL_DESTINATIONS.find(
      (d) => d.slug === input.destinationSlug,
    );
    if (preferred) return preferred;
  }
  if (userDna) {
    return [...ALL_DESTINATIONS].sort((a, b) => {
      const diff =
        compatibilityScore(userDna, b.dna) - compatibilityScore(userDna, a.dna);
      return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
    })[0]!;
  }
  return [...ALL_DESTINATIONS].sort((a, b) => {
    const diff = scoreDestination(b, input.style) - scoreDestination(a, input.style);
    return diff !== 0 ? diff : a.slug.localeCompare(b.slug);
  })[0]!;
}

function activityPool(d: Destination, style: TravelStyle): ActivityTemplate[] {
  const gems: ActivityTemplate[] = d.hiddenGems.map((g, i) => ({
    title: `Discover ${g.title}`,
    startTime: i === 0 ? "11:00" : "15:30",
    cost: 1500,
  }));
  const nearby: ActivityTemplate[] = d.nearby.map((n) => ({
    title: `Day trip to ${n.name}`,
    startTime: "09:00",
    cost: 2500,
  }));
  return [...STYLE_ACTIVITIES[style], ...gems, ...nearby];
}

const STYLE_LABEL: Record<TravelStyle, string> = {
  adventure: "Adventure",
  culture: "Culture",
  food: "Food & flavor",
  nature: "Nature",
  luxury: "Luxury",
};

export function generateTrip(
  input: TripInput,
  destination: Destination,
): GeneratedTrip {
  const d = destination;
  const pool = activityPool(d, input.style);
  const seed = seedFrom(`${d.slug}:${input.style}:${input.days}`);

  // Build days with up to `perDay` activities, rotating deterministically through the pool.
  const buildDays = (perDay: number): GeneratedDay[] => {
    const days: GeneratedDay[] = [];
    let cursor = seed;
    for (let n = 1; n <= input.days; n++) {
      const items: GeneratedItem[] = [];
      for (let i = 0; i < perDay; i++) {
        const tpl = pool[cursor % pool.length]!;
        const gi = cursor;
        cursor += 1;
        const coords = jitter(d.coordinates, seed + gi);
        items.push({
          title: tpl.title,
          startTime: tpl.startTime,
          cost: tpl.cost,
          note: null,
          description: `A ${STYLE_LABEL[input.style].toLowerCase()} stop in ${d.name}.`,
          lat: coords.lat,
          lng: coords.lng,
          image: `go/destinations/${d.slug}/plan-${gi}`,
        });
      }
      // sort the day's items by time for a natural schedule
      items.sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""));
      days.push({ dayIndex: n, title: `Day ${n} · ${STYLE_LABEL[input.style]}`, items });
    }
    return days;
  };

  const dailyBase = d.budget.accommodation + d.budget.food + d.budget.transport;
  const notes: string[] = [];

  // Start at 3 activities/day and trim if it blows the budget.
  let perDay = 3;
  let itinerary = buildDays(perDay);
  const activitiesOf = (days: GeneratedDay[]) =>
    days.reduce((s, day) => s + day.items.reduce((a, it) => a + it.cost, 0), 0);
  let total = input.days * dailyBase + activitiesOf(itinerary);

  while (total > input.budget && perDay > 1) {
    perDay -= 1;
    itinerary = buildDays(perDay);
    total = input.days * dailyBase + activitiesOf(itinerary);
    notes.push("Trimmed activities to fit your budget.");
  }
  if (total > input.budget) {
    notes.push(
      `This trip is ambitious for the budget — a realistic minimum is about ${formatCents(total)}.`,
    );
  } else if (input.budget - total > dailyBase) {
    notes.push(`You're comfortably under budget — room to upgrade stays or add experiences.`);
  }

  const activities = activitiesOf(itinerary);
  return {
    destinationSlug: d.slug,
    destinationName: d.name,
    style: input.style,
    days: input.days,
    itinerary,
    budget: {
      accommodation: d.budget.accommodation * input.days,
      food: d.budget.food * input.days,
      transport: d.budget.transport * input.days,
      activities,
      total,
      perDay: Math.round(total / input.days),
      vsBudget: input.budget - total,
    },
    notes: Array.from(new Set(notes)),
    center: { lat: d.coordinates.lat, lng: d.coordinates.lng },
    source: "rules",
  };
}

function formatCents(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}
