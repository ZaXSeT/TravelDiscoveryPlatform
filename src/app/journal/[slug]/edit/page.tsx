import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { JournalEditor } from "@/features/journal/components/journal-editor";
import { JournalImageManager } from "@/features/journal/components/journal-image-manager";
import { DeleteJournalButton } from "@/features/journal/components/delete-journal-button";
import { requireUser } from "@/lib/auth/require-user";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { routes } from "@/constants/routes";

export const metadata: Metadata = { title: "Edit journal" };
export const dynamic = "force-dynamic"; // owner-only, auth-protected

export default async function EditJournalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser(routes.journalEdit(slug));
  const supabase = await createSupabaseServerClient();

  const { data: journal } = await supabase
    .from("journals")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!journal || journal.user_id !== user.id || journal.deleted_at) notFound();

  const [{ data: images }, { data: dests }] = await Promise.all([
    supabase
      .from("journal_images")
      .select("*")
      .eq("journal_id", journal.id)
      .order("position", { ascending: true }),
    supabase.from("destinations").select("id, slug"),
  ]);

  const idToSlug = new Map((dests ?? []).map((d) => [d.id, d.slug]));
  const initialDestinationSlug = journal.destination_id
    ? (idToSlug.get(journal.destination_id) ?? null)
    : null;

  return (
    <div className="pt-16 md:pt-20">
      <PageContainer width="default" className="section-y max-w-2xl">
        <div className="flex items-center justify-between">
          <Link
            href={routes.journal}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            All journals
          </Link>
          {journal.visibility === "public" && (
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href={routes.journalEntry(journal.slug)}>
                View <ExternalLink className="size-4" />
              </Link>
            </Button>
          )}
        </div>

        <h1 className="mt-4 font-display text-3xl">Edit journal</h1>

        <div className="mt-8">
          <JournalEditor
            mode="edit"
            journal={journal}
            initialDestinationSlug={initialDestinationSlug}
          />
        </div>

        <hr className="my-10 border-border" />

        <JournalImageManager
          journalId={journal.id}
          coverPath={journal.cover_path}
          images={images ?? []}
        />

        <hr className="my-10 border-border" />

        <DeleteJournalButton id={journal.id} />
      </PageContainer>
    </div>
  );
}
