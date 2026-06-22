"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  stats: {
    saved: number;
    trips: number;
    journals: number;
  };
}

export function ProfileHeader({
  displayName,
  bio,
  avatarPath,
  stats,
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
      toast.success("Profile updated");
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex flex-col gap-8 rounded-[2rem] border border-border/60 bg-surface-1/40 p-8 shadow-sm backdrop-blur-md sm:flex-row sm:items-center md:gap-12 md:p-12 lg:p-16">
      <div className="relative mx-auto sm:mx-0 shrink-0">
        <div className="relative size-32 md:size-40 lg:size-48 overflow-hidden rounded-full border border-border bg-surface-2 shadow-sm">
          {avatarPath ? (
            <Image
              src={storagePublicUrl(BUCKETS.avatars, avatarPath)}
              alt={displayName}
              fill
              sizes="192px"
              className="object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center font-display text-4xl lg:text-5xl tracking-[0.1em] text-primary/60">
              {initials}
            </div>
          )}
        </div>
        <div className="absolute bottom-0 right-0 md:bottom-2 md:right-2">
          <AvatarUploader />
        </div>
      </div>

      <div className="flex-1 w-full text-center sm:text-left">
        {editing ? (
          <form onSubmit={save} className="space-y-4 max-w-2xl mx-auto sm:mx-0">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-1.5 text-left">
              <Label htmlFor="p-name">Name</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 text-lg"
                aria-invalid={fieldErrors.displayName ? true : undefined}
              />
              {fieldErrors.displayName && (
                <p className="text-sm text-destructive">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>
            <div className="space-y-1.5 text-left">
              <Label htmlFor="p-bio">Bio</Label>
              <Textarea
                id="p-bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={3}
                className="text-base"
                placeholder="A short line about you (optional)"
              />
            </div>
            <div className="flex gap-3 justify-center sm:justify-start pt-2">
              <Button type="submit" size="lg" className="rounded-full px-8" disabled={pending}>
                {pending ? "Saving…" : "Save profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="rounded-full px-8"
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
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-light tracking-tight text-primary leading-tight">{displayName}</h1>
                <p className="mt-4 max-w-prose text-lg md:text-xl text-muted-foreground mx-auto sm:mx-0 font-light leading-relaxed">
                  {bio || "No bio yet."}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="default"
                className="mt-2 rounded-full px-6 whitespace-nowrap shrink-0 sm:ml-4"
                onClick={() => setEditing(true)}
              >
                Edit profile
              </Button>
            </div>
            
            <div className="mt-8 md:mt-12 flex items-center justify-center sm:justify-start gap-10 md:gap-16">
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="font-display text-3xl md:text-4xl text-primary leading-none">{stats.saved}</span>
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Saved</span>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="font-display text-3xl md:text-4xl text-primary leading-none">{stats.trips}</span>
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Trips</span>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-1">
                <span className="font-display text-3xl md:text-4xl text-primary leading-none">{stats.journals}</span>
                <span className="text-[10px] md:text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">Journals</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
