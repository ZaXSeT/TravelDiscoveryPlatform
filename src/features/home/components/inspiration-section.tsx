import Link from "next/link";
import { CldImage } from "@/components/media/cld-image";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { Reveal } from "@/components/motion/reveal";
import { INSPIRATION } from "@/constants/inspiration";
import { routes } from "@/constants/routes";

// Static teaser mirroring seed journals. Cards link to the related destination (real
// page) so there are no dead links until the Journal feature ships (Phase 3).
export function InspirationSection() {
  return (
    <section className="section-y bg-background">
      <PageContainer>
        <SectionHeader
          eyebrow="Travel journal"
          title="Stories from the road"
          description="A glimpse of the trips our travelers remember most."
        />
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {INSPIRATION.map((entry, i) => (
            <Reveal key={entry.slug} delayMs={i * 80}>
              <Link
                href={routes.destination(entry.destinationSlug)}
                className="group block overflow-hidden rounded-lg border border-border bg-card"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                  <CldImage
                    publicId={entry.cover}
                    alt={entry.title}
                    width={720}
                    height={450}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-[0.16em] text-accent-goldText">
                    {entry.author}
                  </p>
                  <h3 className="mt-2 font-display text-xl">{entry.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {entry.excerpt}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
