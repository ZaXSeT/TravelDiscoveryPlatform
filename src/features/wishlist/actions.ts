"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthedContext,
  destinationIdForSlug,
} from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import { wishlistAddSchema, wishlistRemoveSchema } from "@/lib/validation/content";
import type { ActionResult } from "@/types";
import { routes } from "@/constants/routes";

export async function wishlistAdd(slug: string): Promise<ActionResult> {
  const parsed = wishlistAddSchema.safeParse({ destinationSlug: slug });
  if (!parsed.success) return fail("validation", "Unknown destination.");

  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in to save destinations.");

  const destId = await destinationIdForSlug(supabase, parsed.data.destinationSlug);
  if (!destId) return fail("not_found", "Destination not found.");

  const { error } = await supabase
    .from("wishlists")
    .insert({ user_id: user.id, destination_id: destId });

  // Unique violation = already saved -> idempotent success.
  if (error && error.code !== "23505") {
    return fail("server_error", "Could not save right now. Please try again.");
  }

  revalidatePath(routes.wishlist);
  revalidatePath(routes.profile);
  return ok();
}

export async function wishlistRemove(slug: string): Promise<ActionResult> {
  const parsed = wishlistRemoveSchema.safeParse({ destinationSlug: slug });
  if (!parsed.success) return fail("validation", "Unknown destination.");

  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  const destId = await destinationIdForSlug(supabase, parsed.data.destinationSlug);
  if (!destId) return fail("not_found", "Destination not found.");

  const { error } = await supabase
    .from("wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("destination_id", destId);

  if (error) return fail("server_error", "Could not remove right now.");

  revalidatePath(routes.wishlist);
  revalidatePath(routes.profile);
  return ok();
}
