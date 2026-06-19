import { DESTINATIONS } from "@/constants/destinations";

// Explore facets derived from the static dataset so filters always match content.

export const REGIONS = Array.from(
  new Set(DESTINATIONS.map((d) => d.region)),
).sort();

export const CATEGORIES = Array.from(
  new Set(DESTINATIONS.flatMap((d) => d.categories)),
).sort();

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "budget-asc", label: "Budget (low to high)" },
  { value: "budget-desc", label: "Budget (high to low)" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

// Homepage category tiles (curated, link into Explore with a preselected filter).
export const HOME_CATEGORIES = [
  { label: "Beaches", category: "Beach" },
  { label: "Cities", category: "City" },
  { label: "Mountains", category: "Mountains" },
  { label: "Food", category: "Food" },
  { label: "Culture", category: "Culture" },
  { label: "Nature", category: "Nature" },
] as const;
