// Domain types shared across the app. DB row types are generated in Phase 3.

export type DnaKey =
  | "adventure"
  | "culture"
  | "food"
  | "nature"
  | "nightlife"
  | "budgetFriendly";

export type TravelStyle =
  | "adventure"
  | "culture"
  | "food"
  | "nature"
  | "luxury";

/** Travel DNA scores, 0–100 per axis. */
export type Dna = Record<DnaKey, number>;

/** All money is integer cents, USD (single-currency scope). */
export interface DestinationBudget {
  accommodation: number; // cents / day
  food: number; // cents / day
  transport: number; // cents / day
}

export interface HiddenGem {
  title: string;
  description: string;
  /** Cloudinary public id (or seed key) resolved by the image resolver. */
  image: string;
}

export interface NearbyAttraction {
  name: string;
  distanceKm: number;
  image: string;
}

export interface DestinationMedia {
  hero: string;
  thumbnail: string;
  videoPoster: string;
  /** 4 gallery image ids. */
  gallery: string[];
}

export interface Destination {
  slug: string;
  name: string;
  country: string;
  region: string;
  /** Short editorial blurb (cards, meta). */
  summary: string;
  /** Longer overview paragraph(s). */
  description: string;
  coordinates: { lat: number; lng: number };
  dna: Dna;
  budget: DestinationBudget;
  travelTips: string[];
  hiddenGems: HiddenGem[];
  nearby: NearbyAttraction[];
  media: DestinationMedia;
  /** Facet tags used by Explore filters. */
  categories: string[];
  bestSeason: string;
}

export interface DestinationSummary {
  slug: string;
  name: string;
  country: string;
  region: string;
  summary: string;
  thumbnail: string;
  categories: string[];
}

/**
 * Tier 2 "Explore" destination — lightweight, frontend-only (not seeded in the DB and
 * not saveable to wishlist/itinerary, which remain Tier 1 / featured-only). Used to make
 * Explore feel like a real catalog without per-destination content overhead.
 */
export interface ExploreDestination {
  slug: string;
  name: string;
  country: string;
  region: string;
  summary: string;
  coordinates: { lat: number; lng: number };
  categories: string[];
  bestSeason: string;
  thumbnail: string;
  hero: string;
  /** Estimated mid-range daily budget, integer cents (USD). */
  budgetPerDay: number;
}

/** A static inspiration entry mirrors a seed journal for the home teaser (Phase 2). */
export interface InspirationEntry {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  destinationSlug: string;
}

/** Canonical Server Action result shape (06_DATA_CONTRACTS.md). */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: {
        code:
          | "unauthorized"
          | "forbidden"
          | "validation"
          | "not_found"
          | "rate_limited"
          | "conflict"
          | "server_error";
        message: string;
        fields?: Record<string, string>;
      };
    };
