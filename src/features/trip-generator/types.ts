import type { TravelStyle } from "@/types";

export interface GeneratedItem {
  title: string;
  startTime: string | null;
  cost: number; // cents
  note: string | null;
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
}

export interface TripInput {
  budget: number; // cents
  days: number;
  style: TravelStyle;
  destinationSlug?: string | null;
}
