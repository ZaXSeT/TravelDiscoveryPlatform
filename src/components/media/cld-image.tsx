import Image from "next/image";
import { imageUrl } from "@/lib/cloudinary/url";

// Single image component for the whole app. Resolves a media public id (assets.ts)
// through the Cloudinary resolver (or dev placeholder) and renders next/image.
interface CldImageProps {
  publicId: string;
  alt: string;
  /** Target render resolution (also drives the resolver's crop size). Optional for
   *  `fill` images, where next/image ignores intrinsic size. */
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  onLoad?: () => void;
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
  onLoad,
}: CldImageProps) {
  const w = width ?? 1200;
  const h = height ?? 800;
  const src = imageUrl(publicId, { w, h });

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
        onLoad={onLoad}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      priority={priority}
      className={className}
      onLoad={onLoad}
    />
  );
}
