import type { DnaKey } from "@/types";

// Travel DNA Assessment — 8 questions. Each option contributes weighted points to one or
// two of the six DNA axes; scoring.ts normalizes the totals to 0–100 per axis.

export interface DnaOption {
  label: string;
  weights: Partial<Record<DnaKey, number>>;
}
export interface DnaQuestion {
  id: string;
  prompt: string;
  options: DnaOption[];
}

export const DNA_QUESTIONS: DnaQuestion[] = [
  {
    id: "morning",
    prompt: "Your ideal first morning somewhere new?",
    options: [
      { label: "Hike to a sunrise viewpoint", weights: { adventure: 2, nature: 2 } },
      { label: "Wander a historic old town", weights: { culture: 2 } },
      { label: "Hunt down the best local breakfast", weights: { food: 2 } },
      { label: "Sleep in after a late night out", weights: { nightlife: 2 } },
    ],
  },
  {
    id: "splurge",
    prompt: "Pick a once-in-a-trip splurge.",
    options: [
      { label: "A dive trip or scenic helicopter ride", weights: { adventure: 2, nature: 1 } },
      { label: "A private heritage or museum tour", weights: { culture: 2 } },
      { label: "A tasting menu at a famous restaurant", weights: { food: 2 } },
      { label: "Bottle service at a rooftop club", weights: { nightlife: 2 } },
    ],
  },
  {
    id: "stay",
    prompt: "Where would you rather stay?",
    options: [
      { label: "An eco-lodge out in the wild", weights: { nature: 2, adventure: 1 } },
      { label: "A boutique hotel in the cultural quarter", weights: { culture: 2 } },
      { label: "An apartment by the food markets", weights: { food: 2 } },
      { label: "A budget stay — spend it on experiences", weights: { budgetFriendly: 2 } },
    ],
  },
  {
    id: "budget",
    prompt: "Your money mindset on the road?",
    options: [
      { label: "Every dollar counts — maximize value", weights: { budgetFriendly: 2 } },
      { label: "Mid-range with the odd treat", weights: { budgetFriendly: 1, food: 1 } },
      { label: "Comfort matters, I'll pay for it", weights: { food: 1, culture: 1 } },
      { label: "Splurge freely for the memories", weights: { nightlife: 1, food: 1 } },
    ],
  },
  {
    id: "afternoon",
    prompt: "A free afternoon — you choose…",
    options: [
      { label: "Kayak, zipline, or bike something", weights: { adventure: 2 } },
      { label: "A gallery or temple visit", weights: { culture: 2 } },
      { label: "A walk through a national park", weights: { nature: 2 } },
      { label: "Café-hop and people-watch", weights: { food: 1, culture: 1 } },
    ],
  },
  {
    id: "evening",
    prompt: "Evenings are for…",
    options: [
      { label: "Stargazing somewhere remote", weights: { nature: 2 } },
      { label: "Live music and great bars", weights: { nightlife: 2 } },
      { label: "A long dinner with locals", weights: { food: 2 } },
      { label: "A cultural performance", weights: { culture: 2 } },
    ],
  },
  {
    id: "vibe",
    prompt: "Choose a dream destination vibe.",
    options: [
      { label: "Rugged mountains and trails", weights: { adventure: 2, nature: 1 } },
      { label: "Ancient cities and museums", weights: { culture: 2 } },
      { label: "A street-food capital", weights: { food: 2 } },
      { label: "A buzzing nightlife metropolis", weights: { nightlife: 2 } },
    ],
  },
  {
    id: "worth-it",
    prompt: "What makes a trip truly 'worth it'?",
    options: [
      { label: "Adrenaline and a real challenge", weights: { adventure: 2 } },
      { label: "Learning something and history", weights: { culture: 2 } },
      { label: "Unforgettable meals", weights: { food: 2 } },
      { label: "Doing it all without overspending", weights: { budgetFriendly: 2 } },
    ],
  },
];
