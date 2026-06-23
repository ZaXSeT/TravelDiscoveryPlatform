import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { CldImage } from "@/components/media/cld-image";
import { HOME_CATEGORIES } from "@/constants/categories";
import { routes } from "@/constants/routes";

export function CategoryTiles() {
  return (
    <section className="py-16 md:py-24 bg-surface-1">
      <PageContainer>
        <SectionHeader
          eyebrow="Browse by mood"
          title="What kind of trip are you after?"
          align="center"
        />
        <div className="mt-12 flex flex-col gap-4 sm:grid sm:grid-cols-3 lg:flex lg:h-[500px] lg:flex-row lg:gap-4 xl:gap-6">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.category}
              href={`${routes.explore}?category=${encodeURIComponent(c.category)}`}
              className="group relative aspect-[4/3] sm:aspect-square lg:aspect-auto lg:flex-1 overflow-hidden rounded-[2rem] bg-surface-2 transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CldImage
                publicId={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw"
                className="object-cover transition-transform duration-1000 group-hover:scale-105 motion-reduce:transition-none"
              />
              {/* Rich gradient scrim */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-700 group-hover:opacity-80" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-4 text-white sm:p-6 lg:p-5">
                <div className="translate-y-4 transition-transform duration-700 group-hover:translate-y-0">
                  <span className="block font-display text-xl sm:text-2xl lg:text-lg xl:text-2xl transition-colors duration-500 group-hover:text-accent-gold">
                    {c.label}
                  </span>
                  
                  {/* Expanding link with arrow */}
                  <div className="grid grid-rows-[0fr] opacity-0 transition-all duration-700 group-hover:grid-rows-[1fr] group-hover:opacity-100">
                    <div className="overflow-hidden">
                      <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/90 sm:text-sm">
                        Explore <ArrowRight className="size-3.5 sm:size-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
