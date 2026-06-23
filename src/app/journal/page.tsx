import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { JournalFeed } from "@/features/journal/components/journal-feed";
import type { JournalSummary } from "@/features/journal/types";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { routes } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Journal",
  description: "Travel stories, guides, and notes from the road.",
};

export default async function JournalPage() {
  let journals: JournalSummary[] = [];

  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    // Explicit public + non-deleted filter so a signed-in user's own drafts never leak in.
    const { data } = await supabase
      .from("journals")
      .select("id, slug, title, excerpt, author_label, cover_path, is_seed")
      .eq("visibility", "public")
      .is("deleted_at", null)
      .order("published_at", { ascending: false });
    journals = data ?? [];
  }

  return (
    <div className="pt-24 md:pt-28 pb-32 min-h-screen bg-background">
      <PageContainer width="full">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-8 mb-10 md:mb-12">
          <div className="max-w-5xl">
            <p className="mb-1 text-[11px] md:text-xs font-semibold uppercase tracking-[0.25em] text-accent-goldText">
              Travel journal
            </p>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl font-light tracking-tight text-primary leading-[1]">
              Stories from <span className="italic text-muted-foreground">the road</span>
            </h1>
            <p className="mt-3 max-w-lg text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
              Published journals from our community and editors.
            </p>
          </div>
          <div className="mt-6 md:mt-0 shrink-0">
            <Button variant="gold" asChild className="gap-1.5 rounded-full px-6">
              <Link href={routes.journalNew}>
                <PenLine className="size-4" />
                Write a journal
              </Link>
            </Button>
          </div>
        </div>
        <div className="mt-10">
          <JournalFeed journals={journals} />
        </div>
      </PageContainer>
    </div>
  );
}
