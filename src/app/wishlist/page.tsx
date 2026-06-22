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
    <div className="pt-8 md:pt-32 pb-32 min-h-screen bg-background">
      <PageContainer width="full">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 mb-10 md:mb-12">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] md:text-xs font-semibold uppercase tracking-[0.2em] text-accent-goldText">
              Wishlist
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight text-primary">
              Saved destinations
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              The places you're dreaming about, saved and synced to your account.
            </p>
          </div>
          <div className="mt-6 md:mt-0 text-sm font-medium text-muted-foreground shrink-0">
            {summaries.length} {summaries.length === 1 ? 'Destination' : 'Destinations'}
          </div>
        </div>
        
        <div>
          <WishlistGrid initial={summaries} />
        </div>
      </PageContainer>
    </div>
  );
}
