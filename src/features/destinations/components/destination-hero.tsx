import { CldImage } from "@/components/media/cld-image";
import { PageContainer } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import type { Destination } from "@/types";

export function DestinationHero({ destination: d }: { destination: Destination }) {
  return (
    <section
      data-theme="dark"
      className="relative flex min-h-[72svh] items-end overflow-hidden bg-dark-0 text-white"
    >
      <CldImage
        publicId={d.media.hero}
        alt={`${d.name}, ${d.country}`}
        width={1920}
        height={1280}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="scrim pointer-events-none absolute inset-0" />
      <PageContainer className="relative z-10 pb-12 pt-28">
        <p className="text-sm uppercase tracking-[0.2em] text-white/80">
          {d.region} · {d.country}
        </p>
        <h1 className="mt-3 font-display text-5xl lg:text-7xl">{d.name}</h1>
        <p className="mt-4 max-w-2xl text-lg text-white/85">{d.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {d.categories.map((c) => (
            <Badge key={c} variant="gold">
              {c}
            </Badge>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
