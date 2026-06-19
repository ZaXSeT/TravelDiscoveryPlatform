import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { JournalEditor } from "@/features/journal/components/journal-editor";
import { requireUser } from "@/lib/auth/require-user";
import { routes } from "@/constants/routes";

export const metadata: Metadata = { title: "New journal" };

export default async function NewJournalPage() {
  await requireUser(routes.journalNew);

  return (
    <div className="pt-16 md:pt-20">
      <PageContainer width="default" className="section-y max-w-2xl">
        <h1 className="font-display text-3xl">Write a journal</h1>
        <p className="mt-2 text-muted-foreground">
          Start with the story. You can add a cover and photos after saving.
        </p>
        <div className="mt-8">
          <JournalEditor mode="create" />
        </div>
      </PageContainer>
    </div>
  );
}
