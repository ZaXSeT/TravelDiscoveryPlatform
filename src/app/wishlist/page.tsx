import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { WishlistGrid } from "@/features/wishlist/components/wishlist-grid";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getDestination, toSummary } from "@/constants/destinations";
import { routes } from "@/constants/routes";
import type { Destination } from "@/types";

export const metadata: Metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic"; // per-user, auth-protected

export default async function WishlistPage() {
  await requireUser(routes.wishlist);
  const supabase = await createSupabaseServerClient();

  const [{ data: rows }, { data: dests }] = await Promise.all([
    supabase
      .from("wishlists")
      .select("destination_id, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("destinations").select("id, slug"),
  ]);

  const idToSlug = new Map((dests ?? []).map((d) => [d.id, d.slug]));
  const summaries = (rows ?? [])
    .map((r) => idToSlug.get(r.destination_id))
    .filter((s): s is string => Boolean(s))
    .map((slug) => getDestination(slug))
    .filter((d): d is Destination => Boolean(d))
    .map(toSummary);

  return (
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <SectionHeader
          eyebrow="Wishlist"
          title="Saved destinations"
          description="The places you're dreaming about — saved and synced to your account."
        />
        <div className="mt-10">
          <WishlistGrid initial={summaries} />
        </div>
      </PageContainer>
    </div>
  );
}
