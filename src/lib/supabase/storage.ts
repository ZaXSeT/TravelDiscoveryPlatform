// Storage helpers. Buckets are public-read (see migration 20260619130000) so images
// render for guests on the public journal feed without per-request signed URLs; WRITES
// remain owner-only via Storage RLS (path prefix = {user_id}/…).

export const BUCKETS = {
  avatars: "avatars",
  journalMedia: "journal-media",
} as const;

export type BucketName = (typeof BUCKETS)[keyof typeof BUCKETS];

export function storagePublicUrl(bucket: BucketName, path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

function extFromType(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function avatarPath(userId: string, type: string): string {
  return `${userId}/${crypto.randomUUID()}.${extFromType(type)}`;
}

export function journalImagePath(
  userId: string,
  journalId: string,
  type: string,
): string {
  return `${userId}/${journalId}/${crypto.randomUUID()}.${extFromType(type)}`;
}
