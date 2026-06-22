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
    <div className="pt-24 md:pt-32 pb-32 min-h-screen bg-background">
      <PageContainer>
        <div className="max-w-4xl mx-auto">
          <CreateItineraryForm />
        </div>
        
        <div className="mt-16 md:mt-24 pt-8 max-w-4xl mx-auto">
          <div className="flex items-end justify-between border-b border-black/10 pb-8 mb-12">
            <div>
              <h3 className="text-3xl md:text-4xl font-semibold">Your Journeys</h3>
              <p className="mt-3 text-base text-muted-foreground md:text-lg">Past & upcoming adventures</p>
            </div>
            <div className="hidden md:block text-sm font-medium text-muted-foreground">
              {items.length} {items.length === 1 ? 'Trip' : 'Trips'}
            </div>
          </div>
          <ItineraryList initial={items} />
        </div>
      </PageContainer>
    </div>
  );
}
