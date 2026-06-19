import { CldImage } from "@/components/media/cld-image";
import type { HiddenGem } from "@/types";

export function HiddenGems({ gems }: { gems: HiddenGem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {gems.map((gem) => (
        <article
          key={gem.title}
          className="group overflow-hidden rounded-lg border border-border bg-card"
        >
          <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
            <CldImage
              publicId={gem.image}
              alt={gem.title}
              width={720}
              height={450}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105 motion-reduce:transition-none"
            />
          </div>
          <div className="p-5">
            <h3 className="font-display text-xl">{gem.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {gem.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
