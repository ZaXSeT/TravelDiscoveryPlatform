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
      className="group flex overflow-hidden rounded-2xl border border-border/40 bg-card shadow-soft transition-all duration-500 hover:-translate-y-1 hover:border-border/80 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-col"
    >
      {/* Compact horizontal thumbnail on phones; full-width banner from sm up. */}
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden bg-surface-2 sm:aspect-[16/10] sm:w-full">
        {journal.cover_path ? (
          <JournalImage
            path={journal.cover_path}
            isSeed={journal.is_seed}
            alt={journal.title}
            width={720}
            height={450}
            fill
            priority={priority}
            sizes="(max-width: 640px) 112px, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-surface-2 to-surface-1" />
        )}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/5" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 lg:p-7">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-accent-goldText sm:text-xs">
          {journal.author_label}
        </p>
        <h3 className="mt-2 line-clamp-2 font-serif text-lg leading-snug text-primary transition-colors duration-300 group-hover:text-accent-goldText sm:mt-3 sm:text-2xl lg:text-[1.6rem]">
          {journal.title}
        </h3>
        {journal.excerpt && (
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:mt-3 sm:line-clamp-3 sm:text-sm">
            {journal.excerpt}
          </p>
        )}
      </div>
    </Link>
  );
}
