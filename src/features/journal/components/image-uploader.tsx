"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { BUCKETS, journalImagePath } from "@/lib/supabase/storage";
import { compressImage } from "@/lib/media/compress";
import { limits } from "@/constants/config";

// We compress before upload, so accept fairly large originals (the result will be small).
const ORIGINAL_MAX_BYTES = 40 * 1024 * 1024;
import {
  addJournalImage,
  setJournalCover,
} from "@/features/journal/actions";

interface ImageUploaderProps {
  journalId: string;
  kind: "cover" | "gallery";
  label: string;
  onUploaded?: () => void;
}

const ACCEPT = limits.uploadMimeTypes;

export function ImageUploader({
  journalId,
  kind,
  label,
  onUploaded,
}: ImageUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!(ACCEPT as readonly string[]).includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > ORIGINAL_MAX_BYTES) {
      setError("Image is too large (max 40 MB).");
      return;
    }
    setPending(true);
    try {
      // Downscale + compress big photos (keeps it HD but small); originals stay if small.
      const upload = await compressImage(file);
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in again.");
        return;
      }
      const path = journalImagePath(user.id, journalId, upload.type);
      const { error: upErr } = await supabase.storage
        .from(BUCKETS.journalMedia)
        .upload(path, upload, { contentType: upload.type, upsert: false });
      if (upErr) {
        setError("Upload failed. Please try again.");
        return;
      }
      const res =
        kind === "cover"
          ? await setJournalCover(journalId, path)
          : await addJournalImage(journalId, path, null);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      router.refresh();
      onUploaded?.();
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={pending}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus className="size-4" />
        {pending ? "Uploading…" : label}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
