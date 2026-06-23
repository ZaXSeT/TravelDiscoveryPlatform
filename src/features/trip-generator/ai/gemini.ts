import "server-only";
import type { Destination, Dna } from "@/types";
import type {
  GeneratedDay,
  GeneratedItem,
  GeneratedTrip,
  TripInput,
} from "@/features/trip-generator/types";

// Gemini-powered itinerary generation via the REST API (gemini-3.5-flash) with Google
// Search grounding. Uses Node's built-in fetch with an AbortController timeout - chosen
// over the @google/genai SDK because the SDK destabilizes Node 24 on error teardown.
// Server-only (the API key never reaches the client). Throws on any failure so the caller
// falls back to the deterministic rule engine.

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
// Grounded (Google Search) generations take ~25–40s warm, but the first/cold call can run
// past 50s. Allow up to ~58s — just under Vercel's 60s Hobby function ceiling — so cold
// calls succeed instead of aborting into the fallback.
const TIMEOUT_MS = 58000;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : null;
}
// A real place should sit in or near the destination — not another city/country. Beyond this
// it's almost certainly a hallucinated coordinate, so we drop it (no stray map markers).
const MAX_PLACE_KM = 300;
function kmBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
function usdToCents(v: unknown): number {
  const n = num(v);
  return n && n > 0 ? Math.round(n * 100) : 0;
}
function sanitizeTime(v: unknown): string | null {
  return typeof v === "string" && TIME_RE.test(v) ? v : null;
}
function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("no json in response");
  return JSON.parse(text.slice(start, end + 1));
}

export async function generateTripWithGemini(
  input: TripInput,
  destination: Destination,
  userDna?: Dna | null,
): Promise<GeneratedTrip> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY missing");
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";

  const budgetUsd = Math.round(input.budget / 100);
  const dna = destination.dna;
  const dnaLine = `adventure ${dna.adventure}/100, culture ${dna.culture}/100, food ${dna.food}/100, nature ${dna.nature}/100, nightlife ${dna.nightlife}/100, budget-friendliness ${dna.budgetFriendly}/100`;
  const dailyRef = Math.round(
    (destination.budget.accommodation +
      destination.budget.food +
      destination.budget.transport) /
      100,
  );
  const localPlaces = [
    ...destination.hiddenGems.map((g) => g.title),
    ...destination.nearby.map((n) => n.name),
  ]
    .slice(0, 6)
    .join("; ");
  const userDnaLine = userDna
    ? `\n\nThe traveler's OWN Travel DNA (0–100): adventure ${userDna.adventure}, culture ${userDna.culture}, food ${userDna.food}, nature ${userDna.nature}, nightlife ${userDna.nightlife}, budget-friendliness ${userDna.budgetFriendly}. Prioritize experiences where the traveler's high axes overlap this destination's strengths, and explain choices accordingly.`
    : "";

  // Destination data is the source of truth; Gemini is the assistant that enriches it.
  const prompt = `You are ORBIS's AI travel planner. Plan a ${input.days}-day trip to ${destination.name}, ${destination.country} - do NOT change the destination. Traveler style: "${input.style}". Total budget roughly $${budgetUsd} (USD, per person). Best time to visit: ${destination.bestSeason}.

This destination's Travel DNA (0–100): ${dnaLine}. Tailor the pace and mix of activities to it (e.g. high food = more culinary stops; high nature = more outdoors). Typical mid-range cost here is about $${dailyRef}/day. Weave in these notable local places where they fit: ${localPlaces}. Add current, specific, real places (with accurate coordinates) using search.${userDnaLine}

Return ONLY a JSON object - no markdown, no commentary - with EXACTLY this shape:
{
  "dailyUsd": { "accommodation": number, "food": number, "transport": number },
  "notes": string[],
  "days": [
    { "title": string, "items": [
      { "name": string, "description": string, "lat": number, "lng": number, "startTime": "HH:MM", "costUsd": number, "imageQuery": string }
    ] }
  ]
}
Rules:
- exactly ${input.days} day objects, in order (Day 1 first); 3 items per day.
- Within each day, list items in strict chronological order by startTime, flowing morning → afternoon → evening (e.g. ~09:00, ~13:00, ~19:00). Times must increase down the day. Use "HH:MM" 24-hour, realistic for when each place is actually open.
- Each day should cover ONE area/cluster: group places that are geographically close together so the route flows without long back-and-forth. Different days can cover different parts.
- every item must be a real, currently-operating, visitable place or experience (landmark, museum, temple, market, restaurant, café, park, beach, viewpoint, tour or activity) in or near ${destination.name}, with accurate "lat"/"lng".
- "title" names the day's area or theme (e.g. "Day 1 · Old Town & Markets").
- "costUsd" approximate per person (0 if free); "imageQuery" 2–4 words; "notes" 1–3 short practical tips.

Do NOT include logistics as items: no flights, airport arrivals/departures, train/bus transfers, hotel check-in/check-out, "free time", "relax at hotel", or generic transit — only actual things to see and do. Put any arrival/transport tips in "notes" instead.`;

  const body = JSON.stringify({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    // Cap "thinking": a structured itinerary needs little reasoning, and full thinking
    // pushed latency to ~58s (over the timeout). A small budget keeps quality while
    // cutting latency to ~25s and cost by ~half.
    generationConfig: { temperature: 0.6, thinkingConfig: { thinkingBudget: 512 } },
  });

  // Flash models intermittently return 503 ("high demand") / 429. Rather than dropping to the
  // offline planner, try the primary model once, then the lighter fallback (usually available)
  // several times with growing backoff — all inside the time budget. When Google is broadly
  // overloaded even this fails, and that's what the offline planner is for.
  const FALLBACK_MODEL = "gemini-2.5-flash-lite";
  const RETRYABLE = new Set([429, 500, 502, 503, 504]);
  const deadline = Date.now() + TIMEOUT_MS;
  const MAX_ATTEMPTS = 6;
  let res: Response | undefined;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // Primary model first (better quality when it's up); every retry uses the fallback.
    const tryModel = attempt === 0 ? model : FALLBACK_MODEL;
    // Only start an attempt if there's room for a full generation (~20s), not just a 503.
    if (deadline - Date.now() < 22000) break;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), deadline - Date.now());
    try {
      res = await fetch(`${ENDPOINT}/${tryModel}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body,
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    if (res.ok) break;
    if (!RETRYABLE.has(res.status)) throw new Error(`Gemini HTTP ${res.status}`);
    console.warn(
      `[trip-generator] ${tryModel} HTTP ${res.status} (attempt ${attempt + 1}/${MAX_ATTEMPTS})`,
    );
    // Growing backoff (capped) before retrying the fallback model.
    await new Promise((r) => setTimeout(r, Math.min(3000, 600 * (attempt + 1))));
  }
  if (!res || !res.ok) {
    throw new Error(`Gemini HTTP ${res?.status ?? "no-response"}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? "")
    .join("");
  const raw = extractJson(text) as {
    dailyUsd?: { accommodation?: number; food?: number; transport?: number };
    notes?: string[];
    days?: { title?: string; items?: Record<string, unknown>[] }[];
  };

  const days = Math.min(14, Math.max(1, input.days));
  const rawDays = (raw.days ?? []).slice(0, days);
  if (rawDays.length === 0) throw new Error("Gemini returned no days");

  const itinerary: GeneratedDay[] = rawDays.map((d, di) => {
    const items: GeneratedItem[] = (d.items ?? []).slice(0, 4).map((it) => {
      // Reject coordinates that fall implausibly far from the destination (hallucinated /
      // wrong-city), so the route map only ever plots places that are actually there.
      let lat = num(it.lat);
      let lng = num(it.lng);
      if (
        lat !== null &&
        lng !== null &&
        kmBetween(
          lat,
          lng,
          destination.coordinates.lat,
          destination.coordinates.lng,
        ) > MAX_PLACE_KM
      ) {
        lat = null;
        lng = null;
      }
      return {
        title: String(it.name ?? "Activity").slice(0, 160),
        description: it.description ? String(it.description).slice(0, 400) : null,
        startTime: sanitizeTime(it.startTime),
        cost: usdToCents(it.costUsd),
        note: null,
        lat,
        lng,
        image: String(it.imageQuery ?? it.name ?? "travel"),
      };
    });
    // Guarantee chronological order within the day (timed items first, by time).
    items.sort(
      (a, b) => (a.startTime ?? "99:99").localeCompare(b.startTime ?? "99:99"),
    );
    // Keep the theme only; the UI prints the "Day N" label, so strip any leading "Day N".
    const title = String(d.title ?? "")
      .replace(/^\s*day\s*\d+\s*[:·\-–—.]*\s*/i, "")
      .trim();
    return { dayIndex: di + 1, title, items };
  });

  const allItems = itinerary.flatMap((d) => d.items);
  const coords = allItems.filter(
    (i): i is GeneratedItem & { lat: number; lng: number } =>
      typeof i.lat === "number" && typeof i.lng === "number",
  );
  const center =
    coords.length > 0
      ? {
          lat: coords.reduce((s, i) => s + i.lat, 0) / coords.length,
          lng: coords.reduce((s, i) => s + i.lng, 0) / coords.length,
        }
      : undefined;

  const accommodation = usdToCents(raw.dailyUsd?.accommodation) * days;
  const food = usdToCents(raw.dailyUsd?.food) * days;
  const transport = usdToCents(raw.dailyUsd?.transport) * days;
  const activities = allItems.reduce((s, i) => s + i.cost, 0);
  const total = accommodation + food + transport + activities;

  return {
    // Identity is locked to our catalog destination (source of truth), not Gemini's.
    destinationName: destination.name,
    destinationSlug: destination.slug,
    style: input.style,
    days,
    itinerary,
    budget: {
      accommodation,
      food,
      transport,
      activities,
      total,
      perDay: Math.round(total / days),
      vsBudget: input.budget - total,
    },
    notes: Array.isArray(raw.notes) ? raw.notes.slice(0, 3).map(String) : [],
    center: center ?? destination.coordinates,
    source: "gemini",
  };
}
