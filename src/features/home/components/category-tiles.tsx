import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { SectionHeader } from "@/components/layout/section-header";
import { CldImage } from "@/components/media/cld-image";
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
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {HOME_CATEGORIES.map((c) => (
            <Link
              key={c.category}
              href={`${routes.explore}?category=${encodeURIComponent(c.category)}`}
              className="group relative flex aspect-[3/4] overflow-hidden rounded-xl bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <CldImage
                publicId={c.image}
                alt={c.label}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none"
              />
              <div className="scrim pointer-events-none absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <span className="block font-display text-xl transition-transform duration-500 group-hover:-translate-y-1">
                  {c.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
