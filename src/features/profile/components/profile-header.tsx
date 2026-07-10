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
import { BannerUploader } from "@/features/profile/components/banner-uploader";
import { updateProfile } from "@/features/profile/actions";
import { storagePublicUrl, BUCKETS } from "@/lib/supabase/storage";
import { MapPin, Bookmark, BookOpen } from "lucide-react";

interface ProfileHeaderProps {
  displayName: string;
  bio: string | null;
  avatarPath: string | null;
  bannerPath?: string | null;
  isReadOnly?: boolean;
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
  bannerPath,
  isReadOnly = false,
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
    if (isReadOnly) return;
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
    <div className="relative w-full overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-border/40 bg-background shadow-soft transition-all duration-300">
      {/* Cover Banner */}
      <div className="h-32 sm:h-48 md:h-64 w-full relative bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 overflow-hidden group/banner">
        {bannerPath && (
          <Image
            src={storagePublicUrl(BUCKETS.avatars, bannerPath)}
            alt="Profile Banner"
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/5" />
        
        {!isReadOnly && (
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300">
            <BannerUploader />
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="px-5 sm:px-6 md:px-12 pb-8 sm:pb-12 relative">
        <div className="flex items-end justify-between -mt-14 sm:-mt-20 md:-mt-24 gap-4 mb-4 sm:mb-6 relative z-10">
          <div className="relative shrink-0 group">
            <div className="relative size-24 sm:size-36 md:size-48 overflow-hidden rounded-full border-4 md:border-[6px] border-background bg-surface-2 shadow-card transition-transform duration-300 group-hover:scale-[1.02]">
              {avatarPath ? (
                <Image
                  src={storagePublicUrl(BUCKETS.avatars, avatarPath)}
                  alt={displayName}
                  fill
                  sizes="(max-width: 640px) 96px, (max-width: 768px) 144px, 192px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center font-display text-3xl sm:text-5xl lg:text-6xl tracking-[0.1em] text-primary/60">
                  {initials}
                </div>
              )}
            </div>
            {!isReadOnly && (
              <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 md:bottom-4 md:right-4 z-20 opacity-100 transition-opacity">
                <AvatarUploader />
              </div>
            )}
          </div>

          {!isReadOnly && (
            <div className="flex-1 w-full flex justify-end pb-1 sm:pb-2 md:pb-4">
              {!editing && (
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full px-5 h-9 sm:px-8 sm:h-12 text-xs sm:text-sm md:text-base font-medium shadow-sm hover:shadow-md transition-all duration-300"
                  onClick={() => setEditing(true)}
                >
                  Edit profile
                </Button>
              )}
            </div>
          )}
        </div>

        {editing && !isReadOnly ? (
          <form onSubmit={save} className="space-y-5 sm:space-y-6 max-w-2xl mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] sm:text-xs">Display Name</Label>
              <Input
                id="p-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-12 sm:h-14 text-base sm:text-lg bg-surface-1 border-transparent focus:border-primary transition-colors rounded-xl"
                aria-invalid={fieldErrors.displayName ? true : undefined}
              />
              {fieldErrors.displayName && (
                <p className="text-sm text-destructive">
                  {fieldErrors.displayName}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-bio" className="text-muted-foreground font-medium uppercase tracking-wider text-[10px] sm:text-xs">Bio</Label>
              <Textarea
                id="p-bio"
                value={bioText}
                onChange={(e) => setBioText(e.target.value)}
                rows={4}
                className="text-sm sm:text-base bg-surface-1 border-transparent focus:border-primary transition-colors rounded-xl resize-none"
                placeholder="A short line about you and your travel style"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
              <Button type="submit" size="lg" className="rounded-full w-full sm:w-auto px-10 h-12 sm:h-14 text-sm sm:text-base shadow-md hover:shadow-lg transition-all" disabled={pending}>
                {pending ? "Saving…" : "Save profile"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="rounded-full w-full sm:w-auto px-10 h-12 sm:h-14 text-sm sm:text-base"
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
          <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-foreground">{displayName}</h1>
              <p className="mt-2 sm:mt-4 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground font-light leading-relaxed">
                {bio || "No bio yet."}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 sm:gap-x-12 gap-y-4 sm:gap-y-6 pt-3 sm:pt-4 border-t border-border/40">
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="flex size-10 sm:size-14 items-center justify-center rounded-xl sm:rounded-2xl bg-surface-1 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <Bookmark className="size-4 sm:size-6" />
                </div>
                <div>
                  <div className="font-display text-xl sm:text-3xl font-semibold leading-none text-foreground">{stats.saved}</div>
                  <div className="text-[10px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-muted-foreground mt-1">Saved</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="flex size-10 sm:size-14 items-center justify-center rounded-xl sm:rounded-2xl bg-surface-1 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <MapPin className="size-4 sm:size-6" />
                </div>
                <div>
                  <div className="font-display text-xl sm:text-3xl font-semibold leading-none text-foreground">{stats.trips}</div>
                  <div className="text-[10px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-muted-foreground mt-1">Trips</div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-4 group">
                <div className="flex size-10 sm:size-14 items-center justify-center rounded-xl sm:rounded-2xl bg-surface-1 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <BookOpen className="size-4 sm:size-6" />
                </div>
                <div>
                  <div className="font-display text-xl sm:text-3xl font-semibold leading-none text-foreground">{stats.journals}</div>
                  <div className="text-[10px] sm:text-xs font-semibold tracking-[0.1em] sm:tracking-[0.2em] uppercase text-muted-foreground mt-1">Journals</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
