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
    <div className="pt-16 md:pt-20">
      <PageContainer className="section-y">
        <SectionHeader
          eyebrow="Travel journal"
          title="Stories from the road"
          description="Published journals from our community and editors."
          action={
            <Button asChild className="gap-1.5">
              <Link href={routes.journalNew}>
                <PenLine className="size-4" />
                Write a journal
              </Link>
            </Button>
          }
        />
        <div className="mt-10">
          <JournalFeed journals={journals} />
        </div>
      </PageContainer>
    </div>
  );
}
