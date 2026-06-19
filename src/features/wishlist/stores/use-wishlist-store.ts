"use client";

import { create } from "zustand";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/browser";
import { wishlistAdd, wishlistRemove } from "@/features/wishlist/actions";

// Ephemeral client cache of the user's saved slugs, used to drive Save buttons.
// The /wishlist page is the source of truth on refresh (server-rendered from DB).
interface WishlistState {
  slugs: Set<string>;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  has: (slug: string) => boolean;
  add: (slug: string) => Promise<boolean>;
  remove: (slug: string) => Promise<boolean>;
  reset: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  slugs: new Set(),
  loaded: false,
  loading: false,

  has: (slug) => get().slugs.has(slug),

  reset: () => set({ slugs: new Set(), loaded: false }),

  load: async () => {
    if (!isSupabaseConfigured || get().loading) return;
    set({ loading: true });
    try {
      const supabase = getSupabaseBrowserClient();
      const [{ data: rows }, { data: dests }] = await Promise.all([
        supabase.from("wishlists").select("destination_id"),
        supabase.from("destinations").select("id, slug"),
      ]);
      const idToSlug = new Map((dests ?? []).map((d) => [d.id, d.slug]));
      const slugs = new Set<string>();
      for (const row of rows ?? []) {
        const slug = idToSlug.get(row.destination_id);
        if (slug) slugs.add(slug);
      }
      set({ slugs, loaded: true });
    } finally {
      set({ loading: false });
    }
  },

  add: async (slug) => {
    const next = new Set(get().slugs);
    next.add(slug);
    set({ slugs: next }); // optimistic
    const res = await wishlistAdd(slug);
    if (!res.ok) {
      const reverted = new Set(get().slugs);
      reverted.delete(slug);
      set({ slugs: reverted });
      return false;
    }
    return true;
  },

  remove: async (slug) => {
    const next = new Set(get().slugs);
    next.delete(slug);
    set({ slugs: next }); // optimistic
    const res = await wishlistRemove(slug);
    if (!res.ok) {
      const reverted = new Set(get().slugs);
      reverted.add(slug);
      set({ slugs: reverted });
      return false;
    }
    return true;
  },
}));
