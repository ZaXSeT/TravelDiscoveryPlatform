import Link from "next/link";
import { JournalImage } from "@/features/journal/components/journal-image";
import { routes } from "@/constants/routes";
import type { JournalSummary } from "@/features/journal/types";

export function JournalCard({
  journal,
  priority,
}: {
  journal: JournalSummary;
  priority?: boolean;
}) {
  return (
    <Link
      href={routes.journalEntry(journal.slug)}
      className="group block overflow-hidden rounded-lg border border-border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        {journal.cover_path ? (
          <JournalImage
            path={journal.cover_path}
            isSeed={journal.is_seed}
            alt={journal.title}
            width={720}
            height={450}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-2 to-surface-1" />
        )}
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-[0.16em] text-accent-goldText">
          {journal.author_label}
        </p>
        <h3 className="mt-2 font-display text-xl">{journal.title}</h3>
        {journal.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {journal.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
