import "server-only";
import type { Destination, Dna } from "@/types";
import type {
  GeneratedDay,
  GeneratedItem,
  GeneratedTrip,
  TripInput,
} from "@/features/trip-generator/types";

// Gemini-powered itinerary generation via the REST API (gemini-3.5-flash) with Google
// Search grounding. Uses Node's built-in fetch with an AbortController timeout — chosen
// over the @google/genai SDK because the SDK destabilizes Node 24 on error teardown.
// Server-only (the API key never reaches the client). Throws on any failure so the caller
// falls back to the deterministic rule engine.

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
// Grounded (Google Search) generations realistically take ~30–40s, so the timeout must be
// generous or every successful call gets aborted into the fallback.
const TIMEOUT_MS = 50000;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function num(v: unknown): number | null {
  const n = typeof v === "string" ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : null;
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
  const prompt = `You are ORBIS's AI travel planner. Plan a ${input.days}-day trip to ${destination.name}, ${destination.country} — do NOT change the destination. Traveler style: "${input.style}". Total budget roughly $${budgetUsd} (USD, per person). Best time to visit: ${destination.bestSeason}.

This destination's Travel DNA (0–100): ${dnaLine}. Tailor the pace and mix of activities to it (e.g. high food = more culinary stops; high nature = more outdoors). Typical mid-range cost here is about $${dailyRef}/day. Weave in these notable local places where they fit: ${localPlaces}. Add current, specific, real places (with accurate coordinates) using search.${userDnaLine}

Return ONLY a JSON object — no markdown, no commentary — with EXACTLY this shape:
{
  "dailyUsd": { "accommodation": number, "food": number, "transport": number },
  "notes": string[],
  "days": [
    { "title": string, "items": [
      { "name": string, "description": string, "lat": number, "lng": number, "startTime": "HH:MM", "costUsd": number, "imageQuery": string }
    ] }
  ]
}
Rules: exactly ${input.days} day objects; 3 items per day, ordered by startTime; "name" is a real place/landmark/restaurant in or near ${destination.name}; "lat"/"lng" are its accurate coordinates; "costUsd" approximate per person (0 if free); "imageQuery" is 2–4 words to find a representative photo; "notes" has 1–3 short practical tips.`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let res: Response;
  try {
    res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        // Cap "thinking": a structured itinerary needs little reasoning, and full thinking
        // pushed latency to ~58s (over the timeout). A small budget keeps quality while
        // cutting latency to ~25s and cost by ~half.
        generationConfig: { temperature: 0.6, thinkingConfig: { thinkingBudget: 512 } },
      }),
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

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
    const items: GeneratedItem[] = (d.items ?? []).slice(0, 4).map((it) => ({
      title: String(it.name ?? "Activity").slice(0, 160),
      description: it.description ? String(it.description).slice(0, 400) : null,
      startTime: sanitizeTime(it.startTime),
      cost: usdToCents(it.costUsd),
      note: null,
      lat: num(it.lat),
      lng: num(it.lng),
      image: String(it.imageQuery ?? it.name ?? "travel"),
    }));
    return { dayIndex: di + 1, title: String(d.title ?? `Day ${di + 1}`), items };
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
