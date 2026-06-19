import "server-only";

import type { User } from "@supabase/supabase-js";
import {
  createSupabaseServerClient,
  type SupabaseServerClient,
} from "@/lib/supabase/server";

export interface ActionContext {
  supabase: SupabaseServerClient;
  user: User | null;
}

export async function getAuthedContext(): Promise<ActionContext> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

/** Resolve a known destination slug to its DB id (destinations are seeded). */
export async function destinationIdForSlug(
  supabase: SupabaseServerClient,
  slug: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("destinations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  return data?.id ?? null;
}
