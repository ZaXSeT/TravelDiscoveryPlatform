import { ALL_DESTINATIONS } from "@/constants/destinations";

// Explore facets. Regions are derived from the full catalog (both tiers); categories are
// the canonical 7 used for filtering/recommendations (destinations may carry extra tags).

export const REGIONS = Array.from(
  new Set(ALL_DESTINATIONS.map((d) => d.region)),
).sort();

export const CATEGORIES: string[] = [
  "Beach",
  "City",
  "Nature",
  "Adventure",
  "Luxury",
  "Culture",
  "Food",
];

export const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "name-asc", label: "Name (A–Z)" },
  { value: "budget-asc", label: "Budget (low to high)" },
  { value: "budget-desc", label: "Budget (high to low)" },
] as const;

export type SortValue = (typeof SORTS)[number]["value"];

// Homepage category tiles (curated, link into Explore with a preselected filter).
export const HOME_CATEGORIES = [
  { label: "Beaches", category: "Beach", image: "go/category/bali" },
  { label: "Cities", category: "City", image: "go/category/tokyo" },
  { label: "Adventure", category: "Adventure", image: "go/category/switzerland" },
  { label: "Food", category: "Food", image: "go/category/paris" },
  { label: "Culture", category: "Culture", image: "go/category/new-york" },
  { label: "Nature", category: "Nature", image: "go/category/landscape" },
] as const;
