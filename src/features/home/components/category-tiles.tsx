import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { HOME_CATEGORIES } from "@/constants/categories";
import { routes } from "@/constants/routes";

export function CategoryTiles() {
  return (
    <section className="section-y bg-surface-1">
      <PageContainer>
        <SectionHeader
          eyebrow="Browse by mood"
          title="What kind of trip are you after?"
          align="center"
        />
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.category}
              href={`${routes.explore}?category=${encodeURIComponent(c.category)}`}
              className="flex aspect-square items-center justify-center rounded-lg border border-border bg-card p-4 text-center font-display text-lg transition-colors hover:border-accent-gold hover:text-accent-goldText"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
