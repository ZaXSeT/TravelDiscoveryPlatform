import type {
  ItineraryRow,
  ItineraryDayRow,
  ItineraryItemRow,
} from "@/types/db";

export interface PlannerDay extends ItineraryDayRow {
  items: ItineraryItemRow[];
}

export interface PlannerData {
  itinerary: ItineraryRow;
  days: PlannerDay[];
}

export interface ItineraryListItem {
  id: string;
  title: string;
  total_budget: number;
  created_at: string;
  destinationName: string | null;
}
