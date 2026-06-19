import { CldImage } from "@/components/media/cld-image";
import type { HiddenGem } from "@/types";

export function HiddenGems({ gems }: { gems: HiddenGem[] }) {
  return (
    <div className="space-y-20 md:space-y-32">
      {gems.map((gem, i) => {
        const isEven = i % 2 === 0;
        return (
          <article
            key={gem.title}
            className={`flex flex-col items-center gap-8 md:flex-row ${
              isEven ? "" : "md:flex-row-reverse"
            } md:gap-16 lg:gap-24`}
          >
            <div className="w-full md:w-[60%]">
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-2">
                <CldImage
                  publicId={gem.image}
                  alt={gem.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              </div>
            </div>
            <div className="w-full md:w-[40%]">
              <div className="max-w-md">
                <span className="text-sm font-medium uppercase tracking-[0.2em] text-accent-goldText">
                  0{i + 1}
                </span>
                <h3 className="mt-4 font-display text-3xl leading-[1.1] md:text-4xl lg:text-5xl">
                  {gem.title}
                </h3>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  {gem.description}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
