"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Cropper,
  CropperCropArea,
  CropperDescription,
  CropperImage,
} from "@/components/ui/cropper";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { BUCKETS, avatarPath } from "@/lib/supabase/storage";
import { compressImage } from "@/lib/media/compress";
import { limits } from "@/constants/config";
import { setAvatar } from "@/features/profile/actions";

const ACCEPT = limits.uploadMimeTypes;
const ORIGINAL_MAX_BYTES = 40 * 1024 * 1024;

type Area = { x: number; y: number; width: number; height: number };

async function getCroppedFile(imageSrc: string, pixelCrop: Area): Promise<File> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("No 2d context");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(new File([blob], "avatar.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 1);
  });
}

export function AvatarUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Cropper state
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropData, setCropData] = useState<Area | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(ACCEPT as readonly string[]).includes(file.type)) {
      setError("Use a JPEG, PNG, or WebP image.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > ORIGINAL_MAX_BYTES) {
      setError("Image is too large (max 40 MB).");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const url = URL.createObjectURL(file);
    setImageSrc(url);
    if (inputRef.current) inputRef.current.value = ""; // Reset input
  };

  const handleUpload = async () => {
    if (!imageSrc || !cropData) return;
    setPending(true);
    try {
      const croppedFile = await getCroppedFile(imageSrc, cropData);
      const upload = await compressImage(croppedFile, { maxDimension: 600, quality: 0.85 });
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please sign in again.");
        return;
      }

      const path = avatarPath(user.id, upload.type);
      const { error: upErr } = await supabase.storage
        .from(BUCKETS.avatars)
        .upload(path, upload, { contentType: upload.type, upsert: true });
      if (upErr) {
        setError("Upload failed. Please try again.");
        return;
      }

      const res = await setAvatar(path);
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      toast.success("Profile photo updated");
      setImageSrc(null); // Close modal
      router.refresh();
    } catch (err) {
      setError("Failed to crop image.");
    } finally {
      setPending(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setImageSrc(null);
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    }
  };

  return (
    <>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT.join(",")}
          className="sr-only"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-full bg-background shadow-sm hover:bg-surface-1 hover:scale-105 transition-transform"
          onClick={() => inputRef.current?.click()}
          aria-label="Change photo"
        >
          <Camera className="size-4" />
        </Button>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <Dialog open={!!imageSrc} onOpenChange={handleOpenChange}>
        <DialogContent className="left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6">
          <div className="mb-4">
            <DialogTitle className="text-xl font-display">Crop your photo</DialogTitle>
          </div>
          
          <div className="flex flex-col gap-4">
            {imageSrc && (
              <div className="relative overflow-hidden rounded-md bg-black/5">
                <Cropper
                  className="h-[300px] sm:h-[400px] w-full"
                  image={imageSrc}
                  aspectRatio={1}
                  onCropChange={setCropData}
                >
                  <CropperDescription />
                  <CropperImage />
                  <CropperCropArea className="rounded-full pointer-events-none absolute border-2 border-dashed border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
                </Cropper>
              </div>
            )}
            
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUpload}
                disabled={pending || !cropData}
              >
                {pending ? "Saving..." : "Save photo"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
