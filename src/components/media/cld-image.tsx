import Image from "next/image";
import { imageUrl } from "@/lib/cloudinary/url";

// Single image component for the whole app. Resolves a media public id (assets.ts)
// through the Cloudinary resolver (or dev placeholder) and renders next/image.
interface CldImageProps {
  publicId: string;
  alt: string;
  /** Target render resolution (also drives the resolver's crop size). */
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}

export function CldImage({
  publicId,
  alt,
  width,
  height,
  sizes,
  className,
  priority,
  fill,
}: CldImageProps) {
  const src = imageUrl(publicId, { w: width, h: height });

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
