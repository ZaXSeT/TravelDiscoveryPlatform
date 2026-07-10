import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProfileHeader } from "@/features/profile/components/profile-header";
import { ProfileTravelDna } from "@/features/travel-dna/components/profile-travel-dna";
import { sanitizeDna } from "@/features/travel-dna/scoring";
import { JournalCard } from "@/features/journal/components/journal-card";
import type { JournalSummary } from "@/features/journal/types";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", id)
    .maybeSingle();

  if (!data) return { title: "Profile Not Found" };
  return { title: `${data.display_name}'s Profile` };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [
    { data: profile },
    { data: dnaRow },
    { data: journalRows },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name, bio, avatar_path, banner_path")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("travel_dna")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("journals")
      .select("id, slug, title, excerpt, author_label, cover_path, is_seed, visibility")
      .eq("user_id", id)
      .eq("visibility", "public")
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
  ]);

  if (!profile) {
    notFound();
  }

  const journals = journalRows ?? [];
  const travelDna = sanitizeDna(dnaRow?.travel_dna);

  const displayName = profile.display_name || "Traveler";

  return (
    <div className="pt-4 md:pt-20">
      <PageContainer width="full" className="section-y space-y-16">
        <ProfileHeader
          displayName={displayName}
          bio={profile.bio ?? null}
          avatarPath={profile.avatar_path ?? null}
          bannerPath={profile.banner_path ?? null}
          isReadOnly={true}
          stats={{
            saved: 0, // Public profiles don't expose private stats yet
            trips: 0,
            journals: journals.length,
          }}
        />

        <section>
          <SectionHeader
            eyebrow="Travel DNA"
            title={`${displayName}'s traveler profile`}
          />
          <div className="mt-8">
            <ProfileTravelDna dna={travelDna} />
          </div>
        </section>

        <section>
          <SectionHeader
            eyebrow="Journals"
            title={`Published journals by ${displayName}`}
          />
          <div className="mt-8">
            {journals.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="size-6" />}
                title="No journals yet"
                description={`${displayName} hasn't published any journals yet.`}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {journals.map((j) => (
                  <div key={j.id} className="space-y-2">
                    <JournalCard journal={j as JournalSummary} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
