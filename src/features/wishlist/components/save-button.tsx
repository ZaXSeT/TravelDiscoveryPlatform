"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/features/auth/hooks/use-auth-user";
import { useAuthGate } from "@/stores/use-auth-gate";
import { useWishlistStore } from "@/features/wishlist/stores/use-wishlist-store";
import { cn } from "@/lib/utils";

export function SaveButton({ slug, name }: { slug: string; name: string }) {
  const { user, ready } = useAuthUser();
  const openGate = useAuthGate((s) => s.openGate);
  const { has, add, remove, load, loaded } = useWishlistStore();
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (user && !loaded) void load();
  }, [user, loaded, load]);

  const saved = has(slug);

  const doToggle = async () => {
    setPending(true);
    try {
      if (saved) await remove(slug);
      else await add(slug);
    } finally {
      setPending(false);
    }
  };

  const onClick = () => {
    if (!ready) return;
    if (!user) {
      openGate({
        title: `Save ${name}`,
        description: "Sign in to add this destination to your wishlist.",
        onAuthed: async () => {
          await load();
          await add(slug);
        },
      });
      return;
    }
    void doToggle();
  };

  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={pending}
      variant={saved ? "default" : "outline"}
      aria-pressed={saved}
      className="gap-2"
    >
      <Heart className={cn("size-4", saved && "fill-current")} />
      {saved ? "Saved" : "Save to wishlist"}
    </Button>
  );
}
