import { CldImage } from "@/components/media/cld-image";

export function GallerySection({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
      {images.map((id, i) => {
        // Magazine spread pattern: Large, Small, Small, Large
        const isLarge = i % 4 === 0 || i % 4 === 3;
        const colSpan = isLarge ? "md:col-span-2" : "md:col-span-1";
        const aspect = isLarge ? "aspect-[4/3] md:aspect-[16/9]" : "aspect-[4/5]";

        return (
          <div
            key={id}
            className={`group relative overflow-hidden rounded-xl bg-surface-2 ${colSpan} ${aspect}`}
          >
            <CldImage
              publicId={id}
              alt={`${name} — photo ${i + 1}`}
              fill
              sizes={
                isLarge
                  ? "(max-width: 768px) 100vw, 66vw"
                  : "(max-width: 768px) 100vw, 33vw"
              }
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
            />
          </div>
        );
      })}
    </div>
  );
}
