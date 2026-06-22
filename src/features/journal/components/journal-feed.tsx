import { BookOpen } from "lucide-react";
import { JournalCard } from "@/features/journal/components/journal-card";
import { EmptyState } from "@/components/feedback/empty-state";
import type { JournalSummary } from "@/features/journal/types";

export function JournalFeed({ journals }: { journals: JournalSummary[] }) {
  if (journals.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="size-6" />}
        title="No stories yet"
        description="Published travel journals will appear here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {journals.map((j, i) => (
        <JournalCard key={j.id} journal={j} priority={i < 3} />
      ))}
    </div>
  );
}
