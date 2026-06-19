"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { JournalImage } from "@/features/journal/components/journal-image";
import { ImageUploader } from "@/features/journal/components/image-uploader";
import { Button } from "@/components/ui/button";
import { deleteJournalImage } from "@/features/journal/actions";
import type { JournalImageRow } from "@/types/db";

export function JournalImageManager({
  journalId,
  coverPath,
  images,
}: {
  journalId: string;
  coverPath: string | null;
  images: JournalImageRow[];
}) {
  const router = useRouter();

  const removeImage = async (id: string) => {
    const res = await deleteJournalImage(id);
    if (res.ok) router.refresh();
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-lg">Cover image</h3>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="relative aspect-[16/10] w-full max-w-xs overflow-hidden rounded-lg border border-border bg-surface-2">
            {coverPath ? (
              <JournalImage
                path={coverPath}
                isSeed={false}
                alt="Journal cover"
                width={480}
                height={300}
                fill
                sizes="320px"
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No cover yet
              </div>
            )}
          </div>
          <ImageUploader
            journalId={journalId}
            kind="cover"
            label={coverPath ? "Replace cover" : "Upload cover"}
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Gallery</h3>
          <ImageUploader journalId={journalId} kind="gallery" label="Add photo" />
        </div>
        {images.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
            No photos yet.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-md border border-border bg-surface-2"
              >
                <JournalImage
                  path={img.storage_path}
                  isSeed={false}
                  alt={img.alt ?? "Journal photo"}
                  width={320}
                  height={320}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="default"
                  aria-label="Remove photo"
                  onClick={() => removeImage(img.id)}
                  className="absolute right-2 top-2 size-8"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
