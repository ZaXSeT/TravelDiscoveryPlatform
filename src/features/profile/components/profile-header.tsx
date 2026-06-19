"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AvatarUploader } from "@/features/profile/components/avatar-uploader";
import { updateProfile } from "@/features/profile/actions";
import { storagePublicUrl, BUCKETS } from "@/lib/supabase/storage";

interface ProfileHeaderProps {
  displayName: string;
  bio: string | null;
  avatarPath: string | null;
}

export function ProfileHeader({
  displayName,
  bio,
  avatarPath,
}: ProfileHeaderProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(displayName);
  const [bioText, setBioText] = useState(bio ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const initials = displayName.slice(0, 2).toUpperCase();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const res = await updateProfile({
        displayName: name.trim(),
        bio: bioText.trim() ? bioText.trim() : null,
      });
      if (!res.ok) {
        setError(res.error.message);
        if (res.error.fields) setFieldErrors(res.error.fields);
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-3">
        <div className="relative size-24 overflow-hidden rounded-full border border-border bg-surface-2">
          {avatarPath ? (
            <Image
              src={storagePublicUrl(BUCKETS.avatars, avatarPath)}
              alt={displayName}
              fill
              sizes="96px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-display text-2xl text-muted-foreground">
              {initials}
            </div>
          )}
        </div>
        <AvatarUploader />
      </div>

      <div className="flex-1">
        {editing ? (
          <form onSubmit={save} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                aria-invalid={fieldErrors.displayName ? true : undefined}
              />
              {fieldErrors.displayName && (
                <p className="text-sm text-destructive">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-bio">Bio</Label>
              <Textarea
                id="p-bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={3}
                placeholder="A short line about you (optional)"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving…" : "Save profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setName(displayName);
                  setBioText(bio ?? "");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div>
            <h1 className="font-display text-3xl">{displayName}</h1>
            <p className="mt-2 max-w-prose text-muted-foreground">
              {bio || "No bio yet."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setEditing(true)}
            >
              Edit profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
