import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Planner } from "@/features/itinerary/components/planner";
import type { PlannerDay } from "@/features/itinerary/types";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/constants/routes";
import type { ItineraryItemRow } from "@/types/db";

export const metadata: Metadata = { title: "Trip planner" };
export const dynamic = "force-dynamic"; // per-user, auth-protected

export default async function PlannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireUser(routes.itinerary(id));
  const supabase = await createSupabaseServerClient();

  // RLS returns the row only if the current user owns it; otherwise null -> 404.
  const { data: itinerary } = await supabase
    .from("itineraries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!itinerary) notFound();

  const { data: days } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("itinerary_id", id)
    .order("day_index", { ascending: true });

  const dayIds = (days ?? []).map((d) => d.id);
  let items: ItineraryItemRow[] = [];
  if (dayIds.length > 0) {
    const { data } = await supabase
      .from("itinerary_items")
      .select("*")
      .in("day_id", dayIds)
      .order("position", { ascending: true });
    items = data ?? [];
  }

  const plannerDays: PlannerDay[] = (days ?? []).map((d) => ({
    ...d,
    items: items.filter((i) => i.day_id === d.id),
  }));

  return <Planner data={{ itinerary, days: plannerDays }} />;
}
