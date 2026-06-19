"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import { flattenFieldErrors } from "@/lib/validation/flatten";
import { updateProfileSchema } from "@/lib/validation/content";
import type { ActionResult } from "@/types";
import { routes } from "@/constants/routes";

export async function updateProfile(input: {
  displayName: string;
  bio?: string | null;
}): Promise<ActionResult> {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the form.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      bio: parsed.data.bio ?? null,
    })
    .eq("id", user.id);
  if (error) return fail("server_error", "Could not save your profile.");

  // Keep auth metadata in sync so the nav reflects the new name.
  await supabase.auth.updateUser({
    data: { display_name: parsed.data.displayName },
  });

  revalidatePath(routes.profile);
  return ok();
}

export async function setAvatar(storagePath: string): Promise<ActionResult> {
  if (!storagePath) return fail("validation", "Missing image.");
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: storagePath })
    .eq("id", user.id);
  if (error) return fail("server_error", "Could not update your avatar.");
  revalidatePath(routes.profile);
  return ok();
}
