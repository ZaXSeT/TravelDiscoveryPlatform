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
                className="group relative block overflow-hidden rounded-2xl aspect-[4/5] bg-surface-2 shadow-sm transition-shadow hover:shadow-xl"
              >
                <CldImage
                  publicId={entry.cover}
                  alt={entry.title}
                  width={720}
                  height={900}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 motion-reduce:transition-none"
                />
                
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                  <div className="transform transition-transform duration-500 translate-y-4 group-hover:translate-y-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-gold drop-shadow-md mb-3 opacity-90">
                      {entry.author}
                    </p>
                    <h3 className="font-display text-2xl sm:text-3xl tracking-tight text-white drop-shadow-lg mb-3">
                      {entry.title}
                    </h3>
                    <p className="text-sm sm:text-base text-white/80 line-clamp-2 drop-shadow-sm leading-relaxed opacity-0 transition-opacity duration-500 group-hover:opacity-100 delay-100">
                      {entry.excerpt}
                    </p>
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
