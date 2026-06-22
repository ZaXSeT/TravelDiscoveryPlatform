import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, MapPin } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileTravelDna } from "@/features/travel-dna/components/profile-travel-dna";
import { DeleteAccountButton } from "@/features/profile/components/delete-account-button";
import { sanitizeDna } from "@/features/travel-dna/scoring";
import { WishlistGrid } from "@/features/wishlist/components/wishlist-grid";
import { ItineraryList } from "@/features/itinerary/components/itinerary-list";
import { JournalCard } from "@/features/journal/components/journal-card";
import type { ItineraryListItem } from "@/features/itinerary/types";
import type { JournalSummary } from "@/features/journal/types";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDestination, toSummary } from "@/constants/destinations";
import { routes } from "@/constants/routes";
import type { Destination } from "@/types";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic"; // per-user, auth-protected

// Stat component removed, integrated into ProfileHeader for premium design.

export default async function ProfilePage() {
  const user = await requireUser(routes.profile);
  const supabase = await createSupabaseServerClient();

  const [
    { data: profile },
    { data: dnaRow },
    { data: wlRows },
    { data: dests },
    { data: itinRows },
    { data: journalRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_path")
      .eq("id", user.id)
      .maybeSingle(),
    // Separate query: if the travel_dna column isn't migrated yet, only this fails (null),
    // leaving the rest of the profile intact.
    supabase
      .from("profiles")
      .select("travel_dna")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("wishlists")
      .select("destination_id, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("destinations").select("id, slug, name"),
    supabase
      .from("itineraries")
      .select("id, title, total_budget, created_at, destination_id")
      .order("created_at", { ascending: false }),
    supabase
      .from("journals")
      .select("id, slug, title, excerpt, author_label, cover_path, is_seed, visibility")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  const idToSlug = new Map((dests ?? []).map((d) => [d.id, d.slug]));
  const idToName = new Map((dests ?? []).map((d) => [d.id, d.name]));

  const wishlist = (wlRows ?? [])
    .map((r) => idToSlug.get(r.destination_id))
    .filter((s): s is string => Boolean(s))
    .map((slug) => getDestination(slug))
    .filter((d): d is Destination => Boolean(d))
    .map(toSummary);

  const itineraries: ItineraryListItem[] = (itinRows ?? []).map((r) => ({
    id: r.id,
    title: r.title,
    total_budget: r.total_budget,
    created_at: r.created_at,
    destinationName: r.destination_id
      ? (idToName.get(r.destination_id) ?? null)
      : null,
  }));

  const journals = journalRows ?? [];
  const travelDna = sanitizeDna(dnaRow?.travel_dna);

  const displayName =
    profile?.display_name ??
    (user.user_metadata?.display_name as string | undefined) ??
    "Traveler";

  return (
    <div className="pt-4 md:pt-20">
      <PageContainer width="full" className="section-y space-y-16">
        <ProfileHeader
          displayName={displayName}
          bio={profile?.bio ?? null}
          avatarPath={profile?.avatar_path ?? null}
          stats={{
            saved: wishlist.length,
            trips: itineraries.length,
            journals: journals.length,
          }}
        />

        <section>
          <SectionHeader
            eyebrow="Travel DNA"
            title="Your traveler profile"
          />
          <div className="mt-8">
            <ProfileTravelDna dna={travelDna} />
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Wishlist"
            title="Saved destinations"
            action={
              wishlist.length > 0 ? (
                <Button asChild variant="outline">
                  <Link href={routes.wishlist}>View all</Link>
                </Button>
              ) : undefined
            }
          />
          <div className="mt-8">
            <WishlistGrid initial={wishlist} />
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Trips"
            title="Your itineraries"
            action={
              itineraries.length > 0 ? (
                <Button asChild variant="outline">
                  <Link href={routes.itineraries}>View all</Link>
                </Button>
              ) : undefined
            }
          />
          <div className="mt-8">
            {itineraries.length === 0 ? (
              <EmptyState
                icon={<MapPin className="size-6" />}
                title="No trips yet"
                description="Plan a personalized trip with AI, then fine-tune the days and activities yourself."
                action={
                  <Button variant="gold" asChild>
                    <Link href={routes.tripGenerator}>Plan a trip</Link>
                  </Button>
                }
              />
            ) : (
              <ItineraryList initial={itineraries} />
            )}
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Journals"
            title="Your journals"
            action={
              <Button asChild variant="outline">
                <Link href={routes.journalNew}>Write a journal</Link>
              </Button>
            }
          />
          <div className="mt-8">
            {journals.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="size-6" />}
                title="No journals yet"
                description="Write your first travel story."
                action={
                  <Button variant="gold" asChild>
                    <Link href={routes.journalNew}>Write a journal</Link>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {journals.map((j) => (
                  <div key={j.id} className="space-y-2">
                    <JournalCard journal={j as JournalSummary} />
                    <div className="flex items-center justify-between">
                      {j.visibility === "public" ? (
                        <Badge variant="gold">Published</Badge>
                      ) : (
                        <Badge>Draft</Badge>
                      )}
                      <Link
                        href={routes.journalEdit(j.slug)}
                        className="text-sm font-medium text-accent-goldText hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section>
          <SectionHeader eyebrow="Account" title="Danger zone" />
          <div className="mt-8 max-w-2xl">
            <DeleteAccountButton />
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
