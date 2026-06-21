"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import { sanitizeDna } from "@/features/travel-dna/scoring";
import type { ActionResult, Dna } from "@/types";
import { routes } from "@/constants/routes";

// Persist the user's computed Travel DNA to their profile so it can be reused for
// itinerary generation. RLS scopes the update to the owner.
export async function saveTravelDna(dna: Dna): Promise<ActionResult> {
  const clean = sanitizeDna(dna);
  if (!clean) return fail("validation", "Invalid Travel DNA.");

  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in to save your Travel DNA.");

  const { error } = await supabase
    .from("profiles")
    .update({ travel_dna: clean })
    .eq("id", user.id);
  if (error) return fail("server_error", "Could not save your Travel DNA.");

  revalidatePath(routes.travelDna);
  revalidatePath(routes.profile);
  revalidatePath(routes.tripGenerator);
  return ok();
}

/** Read the signed-in user's saved Travel DNA (null if none / signed out). */
export async function getMyTravelDna(): Promise<Dna | null> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("travel_dna")
    .eq("id", user.id)
    .maybeSingle();
  return sanitizeDna(data?.travel_dna);
}
