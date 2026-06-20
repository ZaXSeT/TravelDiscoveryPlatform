"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthedContext,
  destinationIdForSlug,
} from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import { flattenFieldErrors } from "@/lib/validation/flatten";
import { tripGenerateSchema } from "@/lib/validation/content";
import { generateTrip } from "@/features/trip-generator/engine";
import type { TripInput } from "@/features/trip-generator/types";
import type { ActionResult } from "@/types";
import { routes } from "@/constants/routes";

// Persists a generated plan as a real, editable itinerary (source = "generated").
// The engine is re-run server-side from the same inputs for integrity (no client trust).
export async function saveGeneratedTrip(
  input: TripInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = tripGenerateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the trip details.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }

  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in to save this trip.");

  const trip = generateTrip(parsed.data);
  const destinationId = await destinationIdForSlug(supabase, trip.destinationSlug);

  const { data: itin, error: itinErr } = await supabase
    .from("itineraries")
    .insert({
      user_id: user.id,
      title: `${trip.days} days in ${trip.destinationName}`,
      destination_id: destinationId,
      source: "generated",
      style: trip.style,
      total_budget: trip.budget.total,
    })
    .select("id")
    .single();
  if (itinErr || !itin) return fail("server_error", "Could not save the trip.");

  for (const day of trip.itinerary) {
    const { data: dayRow } = await supabase
      .from("itinerary_days")
      .insert({
        itinerary_id: itin.id,
        day_index: day.dayIndex,
        title: day.title,
      })
      .select("id")
      .single();
    if (!dayRow) continue;
    if (day.items.length > 0) {
      await supabase.from("itinerary_items").insert(
        day.items.map((it, i) => ({
          day_id: dayRow.id,
          position: i,
          title: it.title,
          start_time: it.startTime,
          cost: it.cost,
          note: it.note,
        })),
      );
    }
  }

  revalidatePath(routes.itineraries);
  revalidatePath(routes.profile);
  return ok({ id: itin.id });
}
