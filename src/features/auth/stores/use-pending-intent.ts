import { create } from "zustand";

// Captures a guest's save-type action so it can be replayed after authentication
// (02_USER_AND_AUTH_FLOWS.md §4). Consumed by the Phase 3 guest->user gate.
export type PendingIntent =
  | { type: "wishlist.add"; payload: { destinationSlug: string } }
  | { type: "itinerary.create" }
  | { type: "journal.create" }
  | { type: "trip.save"; payload: { destinationSlug: string } };

interface PendingIntentState {
  intent: PendingIntent | null;
  setIntent: (intent: PendingIntent | null) => void;
  clear: () => void;
}

export const usePendingIntent = create<PendingIntentState>((set) => ({
  intent: null,
  setIntent: (intent) => set({ intent }),
  clear: () => set({ intent: null }),
}));
