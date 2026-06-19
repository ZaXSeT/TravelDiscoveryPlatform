"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthedContext,
  destinationIdForSlug,
} from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import { flattenFieldErrors } from "@/lib/validation/flatten";
import {
  itineraryCreateSchema,
  itemCreateSchema,
  itemUpdateSchema,
} from "@/lib/validation/content";
import type { ActionResult } from "@/types";
import type { SupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/constants/routes";

type DB = SupabaseServerClient;

function revalidate(itineraryId?: string) {
  revalidatePath(routes.itineraries);
  revalidatePath(routes.profile);
  if (itineraryId) revalidatePath(routes.itinerary(itineraryId));
}

// Recompute the denormalized itinerary total from its items (single validated place).
async function recomputeTotal(supabase: DB, itineraryId: string) {
  const { data: days } = await supabase
    .from("itinerary_days")
    .select("id")
    .eq("itinerary_id", itineraryId);
  const dayIds = (days ?? []).map((d) => d.id);
  let total = 0;
  if (dayIds.length > 0) {
    const { data: items } = await supabase
      .from("itinerary_items")
      .select("cost")
      .in("day_id", dayIds);
    total = (items ?? []).reduce((sum, i) => sum + i.cost, 0);
  }
  await supabase
    .from("itineraries")
    .update({ total_budget: total })
    .eq("id", itineraryId);
}

export async function createItinerary(input: {
  title: string;
  destinationSlug?: string | null;
  startDate?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  const parsed = itineraryCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the form.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  let destinationId: string | null = null;
  if (parsed.data.destinationSlug) {
    destinationId = await destinationIdForSlug(
      supabase,
      parsed.data.destinationSlug,
    );
  }

  const { data, error } = await supabase
    .from("itineraries")
    .insert({
      user_id: user.id,
      title: parsed.data.title,
      destination_id: destinationId,
      start_date: parsed.data.startDate ?? null,
    })
    .select("id")
    .single();

  if (error || !data) return fail("server_error", "Could not create trip.");
  revalidate(data.id);
  return ok({ id: data.id });
}

export async function updateItineraryTitle(
  id: string,
  title: string,
): Promise<ActionResult> {
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 120) {
    return fail("validation", "Title must be 1–120 characters.");
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("itineraries")
    .update({ title: trimmed })
    .eq("id", id);
  if (error) return fail("server_error", "Could not rename trip.");
  revalidate(id);
  return ok();
}

export async function deleteItinerary(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase.from("itineraries").delete().eq("id", id);
  if (error) return fail("server_error", "Could not delete trip.");
  revalidate();
  return ok();
}

export async function addDay(itineraryId: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { data: last } = await supabase
    .from("itinerary_days")
    .select("day_index")
    .eq("itinerary_id", itineraryId)
    .order("day_index", { ascending: false })
    .limit(1);
  const nextIndex = (last?.[0]?.day_index ?? 0) + 1;
  const { error } = await supabase
    .from("itinerary_days")
    .insert({ itinerary_id: itineraryId, day_index: nextIndex });
  if (error) return fail("server_error", "Could not add a day.");
  revalidate(itineraryId);
  return ok();
}

export async function updateDayTitle(
  itineraryId: string,
  dayId: string,
  title: string,
): Promise<ActionResult> {
  const trimmed = title.trim();
  if (trimmed.length > 120) return fail("validation", "Title too long.");
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("itinerary_days")
    .update({ title: trimmed || null })
    .eq("id", dayId);
  if (error) return fail("server_error", "Could not update the day.");
  revalidate(itineraryId);
  return ok();
}

export async function deleteDay(
  itineraryId: string,
  dayId: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("itinerary_days")
    .delete()
    .eq("id", dayId);
  if (error) return fail("server_error", "Could not delete the day.");
  await recomputeTotal(supabase, itineraryId);
  revalidate(itineraryId);
  return ok();
}

export async function moveDay(
  itineraryId: string,
  dayId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  const { data: days } = await supabase
    .from("itinerary_days")
    .select("id, day_index")
    .eq("itinerary_id", itineraryId)
    .order("day_index", { ascending: true });
  if (!days) return fail("server_error", "Could not reorder.");

  const idx = days.findIndex((d) => d.id === dayId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  const current = days[idx];
  const neighbor = days[swapIdx];
  if (!current || !neighbor) return ok(); // already at the edge

  const TEMP = 100000;
  // Temp value avoids transient unique(itinerary_id, day_index) violation.
  await supabase
    .from("itinerary_days")
    .update({ day_index: TEMP })
    .eq("id", current.id);
  await supabase
    .from("itinerary_days")
    .update({ day_index: current.day_index })
    .eq("id", neighbor.id);
  await supabase
    .from("itinerary_days")
    .update({ day_index: neighbor.day_index })
    .eq("id", current.id);

  revalidate(itineraryId);
  return ok();
}

async function resolveItemDestination(
  supabase: DB,
  slug?: string | null,
): Promise<string | null> {
  if (!slug) return null;
  return destinationIdForSlug(supabase, slug);
}

export async function addItem(
  itineraryId: string,
  input: {
    dayId: string;
    title: string;
    startTime?: string | null;
    cost: number;
    note?: string | null;
    destinationSlug?: string | null;
  },
): Promise<ActionResult> {
  const parsed = itemCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the activity details.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  const { data: last } = await supabase
    .from("itinerary_items")
    .select("position")
    .eq("day_id", parsed.data.dayId)
    .order("position", { ascending: false })
    .limit(1);
  const position = (last?.[0]?.position ?? -1) + 1;

  const destinationId = await resolveItemDestination(
    supabase,
    parsed.data.destinationSlug,
  );

  const { error } = await supabase.from("itinerary_items").insert({
    day_id: parsed.data.dayId,
    title: parsed.data.title,
    start_time: parsed.data.startTime ?? null,
    cost: parsed.data.cost,
    note: parsed.data.note ?? null,
    destination_id: destinationId,
    position,
  });
  if (error) return fail("server_error", "Could not add the activity.");

  await recomputeTotal(supabase, itineraryId);
  revalidate(itineraryId);
  return ok();
}

export async function updateItem(
  itineraryId: string,
  input: {
    id: string;
    title: string;
    startTime?: string | null;
    cost: number;
    note?: string | null;
    destinationSlug?: string | null;
  },
): Promise<ActionResult> {
  const parsed = itemUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the activity details.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  const destinationId = await resolveItemDestination(
    supabase,
    parsed.data.destinationSlug,
  );

  const { error } = await supabase
    .from("itinerary_items")
    .update({
      title: parsed.data.title,
      start_time: parsed.data.startTime ?? null,
      cost: parsed.data.cost,
      note: parsed.data.note ?? null,
      destination_id: destinationId,
    })
    .eq("id", parsed.data.id);
  if (error) return fail("server_error", "Could not update the activity.");

  await recomputeTotal(supabase, itineraryId);
  revalidate(itineraryId);
  return ok();
}

export async function deleteItem(
  itineraryId: string,
  itemId: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("itinerary_items")
    .delete()
    .eq("id", itemId);
  if (error) return fail("server_error", "Could not delete the activity.");
  await recomputeTotal(supabase, itineraryId);
  revalidate(itineraryId);
  return ok();
}
