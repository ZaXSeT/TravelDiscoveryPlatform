"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { BUCKETS, avatarPath } from "@/lib/supabase/storage";
import { limits } from "@/constants/config";
import { setAvatar } from "@/features/profile/actions";

const ACCEPT = limits.uploadMimeTypes;

export function AvatarUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    if (!(ACCEPT as readonly string[]).includes(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > limits.uploadMaxBytes) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    setPending(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setError("Please sign in again.");

      const path = avatarPath(user.id, file.type);
      const { error: upErr } = await supabase.storage
        .from(BUCKETS.avatars)
        .upload(path, file, { contentType: file.type, upsert: true });
      if (upErr) return setError("Upload failed. Please try again.");

      const res = await setAvatar(path);
      if (!res.ok) return setError(res.error.message);
      router.refresh();
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
        <Camera className="size-4" />
        {pending ? "Uploading…" : "Change photo"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}
