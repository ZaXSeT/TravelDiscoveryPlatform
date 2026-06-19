// Image resolver (07_MEDIA_ASSET_PIPELINE_AND_LICENSING.md §7).
// Production: Cloudinary delivery with f_auto/q_auto and a fill crop.
// Dev (no Cloudinary cloud configured): deterministic placeholder so the guest
// experience renders immediately. Same public id -> same image (stable demo).

const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export interface ImageOptions {
  w: number;
  h: number;
}

export function imageUrl(publicId: string, { w, h }: ImageOptions): string {
  if (cloud) {
    const t = `f_auto,q_auto,c_fill,g_auto,w_${w},h_${h}`;
    return `https://res.cloudinary.com/${cloud}/image/upload/${t}/${publicId}`;
  }
  // Deterministic dev placeholder behind the same interface.
  return `https://picsum.photos/seed/${encodeURIComponent(publicId)}/${w}/${h}`;
}

export const usingPlaceholderImages = !cloud;
