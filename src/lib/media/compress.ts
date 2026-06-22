// Client-side image compression before upload. Downscales very large photos and re-encodes
// as high-quality JPEG so storage/bandwidth stay small while the image still looks HD.
// Falls back to the original file on anything unexpected (never blocks an upload).

export interface CompressOptions {
  /** Max length of the longest edge (px). */
  maxDimension?: number;
  /** JPEG quality 0–1. */
  quality?: number;
  /** Target max output size (bytes); quality steps down until under this (best-effort). */
  maxBytes?: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

export async function compressImage(
  file: File,
  opts: CompressOptions = {},
): Promise<File> {
  const { maxDimension = 2000, quality = 0.85, maxBytes = 1_200_000 } = opts;

  // Only raster photos; leave GIFs and non-images untouched.
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const longEdge = Math.max(img.naturalWidth, img.naturalHeight);
    const scale = Math.min(1, maxDimension / longEdge);

    // Already small enough and no downscale needed -> keep as-is.
    if (scale === 1 && file.size <= maxBytes) return file;

    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, width, height);

    let q = quality;
    let blob = await canvasToBlob(canvas, "image/jpeg", q);
    while (blob && blob.size > maxBytes && q > 0.6) {
      q -= 0.08;
      blob = await canvasToBlob(canvas, "image/jpeg", q);
    }

    // No real gain (e.g. already-optimized small JPEG) -> keep original.
    if (!blob || blob.size >= file.size) return file;

    const name = `${file.name.replace(/\.[^.]+$/, "")}.jpg`;
    return new File([blob], name, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}
