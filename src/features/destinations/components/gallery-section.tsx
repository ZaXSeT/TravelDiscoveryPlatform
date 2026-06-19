import { CldImage } from "@/components/media/cld-image";

export function GallerySection({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {images.map((id, i) => (
        <div
          key={id}
          className="relative aspect-[3/4] overflow-hidden rounded-lg bg-surface-2"
        >
          <CldImage
            publicId={id}
            alt={`${name} — photo ${i + 1}`}
            width={500}
            height={667}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 hover:scale-105 motion-reduce:transition-none"
          />
        </div>
      ))}
    </div>
  );
}
