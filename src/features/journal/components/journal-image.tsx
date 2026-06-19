import Image from "next/image";
import { imageUrl } from "@/lib/cloudinary/url";
import { storagePublicUrl, BUCKETS } from "@/lib/supabase/storage";

// Seed journals store a Cloudinary public id; user journals store a Supabase Storage path.
interface JournalImageProps {
  path: string;
  isSeed: boolean;
  alt: string;
  width: number;
  height: number;
  fill?: boolean;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export function JournalImage({
  path,
  isSeed,
  alt,
  width,
  height,
  fill,
  sizes,
  className,
  priority,
}: JournalImageProps) {
  const src = isSeed
    ? imageUrl(path, { w: width, h: height })
    : storagePublicUrl(BUCKETS.journalMedia, path);

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
