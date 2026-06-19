import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { CreateItineraryForm } from "@/features/itinerary/components/create-itinerary-form";
import { ItineraryList } from "@/features/itinerary/components/itinerary-list";
import type { ItineraryListItem } from "@/features/itinerary/types";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/constants/routes";

export const metadata: Metadata = { title: "Trips" };
export const dynamic = "force-dynamic"; // per-user, auth-protected

export default async function ItinerariesPage() {
  await requireUser(routes.itineraries);
  const supabase = await createSupabaseServerClient();

  const [{ data: rows }, { data: dests }] = await Promise.all([
    supabase
      .from("itineraries")
      .select("id, title, total_budget, created_at, destination_id")
      .order("created_at", { ascending: false }),
    supabase.from("destinations").select("id, name"),
  ]);

  const idToName = new Map((dests ?? []).map((d) => [d.id, d.name]));
  const items: ItineraryListItem[] = (rows ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    total_budget: r.total_budget,
    created_at: r.created_at,
    destinationName: r.destination_id
      ? (idToName.get(r.destination_id) ?? null)
      : null,
  }));

  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <SectionHeader
          eyebrow="Trips"
          title="Your itineraries"
          description="Plan day-by-day, track an estimated budget, and pick up where you left off."
        />
        <div className="mt-8 space-y-8">
          <CreateItineraryForm />
          <ItineraryList initial={items} />
        </div>
      </PageContainer>
    </div>
  );
}
