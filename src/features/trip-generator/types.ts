import type { TravelStyle } from "@/types";

export interface GeneratedItem {
  title: string;
  startTime: string | null;
  cost: number; // cents
  note: string | null;
  /** Short description of the place/activity (richer with Gemini). */
  description?: string | null;
  /** Coordinates for the route map. */
  lat?: number | null;
  lng?: number | null;
  /** Image resolver key / search keyword for a photo. */
  image?: string | null;
}

export interface GeneratedDay {
  dayIndex: number;
  title: string;
  items: GeneratedItem[];
}

export interface GeneratedBudget {
  accommodation: number; // cents (per trip)
  food: number;
  transport: number;
  activities: number;
  total: number;
  perDay: number;
  /** input budget − total; positive = under budget. */
  vsBudget: number;
}

export interface GeneratedTrip {
  destinationSlug: string;
  destinationName: string;
  style: TravelStyle;
  days: number;
  itinerary: GeneratedDay[];
  budget: GeneratedBudget;
  notes: string[];
  /** Map centering. */
  center?: { lat: number; lng: number };
  /** "gemini" when AI-generated, else "rules". */
  source?: "gemini" | "rules";
}

export interface TripInput {
  budget: number; // cents
  days: number;
  style: TravelStyle;
  destinationSlug?: string | null;
}
