"use server";

import { revalidatePath } from "next/cache";
import { getAuthedContext } from "@/lib/actions/context";
import {
  createSupabaseAdminClient,
  isAdminConfigured,
} from "@/lib/supabase/admin";
import { BUCKETS, type BucketName } from "@/lib/supabase/storage";
import { ok, fail } from "@/lib/actions/result";
import { flattenFieldErrors } from "@/lib/validation/flatten";
import { updateProfileSchema } from "@/lib/validation/content";
import type { ActionResult } from "@/types";
import { routes } from "@/constants/routes";
import type { SupabaseClient } from "@supabase/supabase-js";

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

// Best-effort removal of a user's files (one level of nesting handles both avatars/{id}/…
// and journal-media/{id}/{journalId}/…). Never throws — account deletion shouldn't fail
// just because storage cleanup hiccups.
async function purgeUserStorage(
  admin: SupabaseClient,
  bucket: BucketName,
  userId: string,
): Promise<void> {
  try {
    const { data: entries } = await admin.storage.from(bucket).list(userId, {
      limit: 1000,
    });
    if (!entries?.length) return;
    const paths: string[] = [];
    for (const e of entries) {
      // A folder has no id; recurse one level into it.
      if (e.id === null) {
        const { data: sub } = await admin.storage
          .from(bucket)
          .list(`${userId}/${e.name}`, { limit: 1000 });
        for (const f of sub ?? []) paths.push(`${userId}/${e.name}/${f.name}`);
      } else {
        paths.push(`${userId}/${e.name}`);
      }
    }
    if (paths.length) await admin.storage.from(bucket).remove(paths);
  } catch {
    /* best-effort */
  }
}

// Permanently delete the signed-in user's account. Deleting the auth user cascades all
// their rows (profiles, wishlists, itineraries, journals) via on-delete-cascade FKs; we
// also purge their uploaded files. Requires the service role (server-only).
export async function deleteAccount(): Promise<ActionResult> {
  const { user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  if (!isAdminConfigured()) {
    return fail("server_error", "Account deletion isn't available right now.");
  }

  const admin = createSupabaseAdminClient();
  await purgeUserStorage(admin, BUCKETS.avatars, user.id);
  await purgeUserStorage(admin, BUCKETS.journalMedia, user.id);

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return fail("server_error", "Could not delete your account. Please try again.");
  }
  return ok();
}
