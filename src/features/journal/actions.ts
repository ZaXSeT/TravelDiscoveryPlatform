"use server";

import { revalidatePath } from "next/cache";
import {
  getAuthedContext,
  destinationIdForSlug,
} from "@/lib/actions/context";
import { ok, fail } from "@/lib/actions/result";
import { flattenFieldErrors } from "@/lib/validation/flatten";
import {
  journalCreateSchema,
  journalUpdateSchema,
} from "@/lib/validation/content";
import type { ActionResult } from "@/types";
import { routes } from "@/constants/routes";

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "journal";
}

function authorLabelFrom(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}): string {
  const meta = user.user_metadata?.display_name;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  return user.email?.split("@")[0] ?? "Traveler";
}

export async function createJournal(input: {
  title: string;
  excerpt?: string | null;
  bodyMarkdown: string;
  destinationSlug?: string | null;
  visibility?: "private" | "public";
}): Promise<ActionResult<{ slug: string }>> {
  const parsed = journalCreateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the form.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  let destinationId: string | null = null;
  if (parsed.data.destinationSlug) {
    destinationId = await destinationIdForSlug(
      supabase,
      parsed.data.destinationSlug,
    );
  }

  const slug = `${slugify(parsed.data.title)}-${crypto.randomUUID().slice(0, 6)}`;
  const isPublic = parsed.data.visibility === "public";

  const { data, error } = await supabase
    .from("journals")
    .insert({
      user_id: user.id,
      author_label: authorLabelFrom(user),
      slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? null,
      body: parsed.data.bodyMarkdown,
      destination_id: destinationId,
      visibility: parsed.data.visibility ?? "private",
      published_at: isPublic ? new Date().toISOString() : null,
    })
    .select("slug")
    .single();

  if (error || !data) return fail("server_error", "Could not create journal.");
  revalidatePath(routes.journal);
  revalidatePath(routes.profile);
  return ok({ slug: data.slug });
}

export async function updateJournal(input: {
  id: string;
  title: string;
  excerpt?: string | null;
  bodyMarkdown: string;
  destinationSlug?: string | null;
  visibility?: "private" | "public";
}): Promise<ActionResult<{ slug: string }>> {
  const parsed = journalUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return fail(
      "validation",
      "Please check the form.",
      flattenFieldErrors(parsed.error.flatten().fieldErrors),
    );
  }
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");

  const { data: current } = await supabase
    .from("journals")
    .select("slug, published_at")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (!current) return fail("not_found", "Journal not found.");

  let destinationId: string | null = null;
  if (parsed.data.destinationSlug) {
    destinationId = await destinationIdForSlug(
      supabase,
      parsed.data.destinationSlug,
    );
  }

  const isPublic = parsed.data.visibility === "public";
  const publishedAt =
    isPublic && !current.published_at
      ? new Date().toISOString()
      : current.published_at;

  const { error } = await supabase
    .from("journals")
    .update({
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? null,
      body: parsed.data.bodyMarkdown,
      destination_id: destinationId,
      visibility: parsed.data.visibility ?? "private",
      published_at: publishedAt,
    })
    .eq("id", parsed.data.id);
  if (error) return fail("server_error", "Could not save the journal.");

  revalidatePath(routes.journal);
  revalidatePath(routes.journalEntry(current.slug));
  revalidatePath(routes.profile);
  return ok({ slug: current.slug });
}

export async function deleteJournal(id: string): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { data: current } = await supabase
    .from("journals")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  const { error } = await supabase
    .from("journals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return fail("server_error", "Could not delete the journal.");
  revalidatePath(routes.journal);
  if (current) revalidatePath(routes.journalEntry(current.slug));
  revalidatePath(routes.profile);
  return ok();
}

export async function setJournalCover(
  journalId: string,
  storagePath: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("journals")
    .update({ cover_path: storagePath })
    .eq("id", journalId);
  if (error) return fail("server_error", "Could not set the cover image.");
  revalidatePath(routes.journal);
  return ok();
}

export async function addJournalImage(
  journalId: string,
  storagePath: string,
  alt: string | null,
): Promise<ActionResult> {
  if (!storagePath) return fail("validation", "Missing image.");
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { data: last } = await supabase
    .from("journal_images")
    .select("position")
    .eq("journal_id", journalId)
    .order("position", { ascending: false })
    .limit(1);
  const position = (last?.[0]?.position ?? -1) + 1;
  const { error } = await supabase.from("journal_images").insert({
    journal_id: journalId,
    storage_path: storagePath,
    alt: alt ?? null,
    position,
  });
  if (error) return fail("server_error", "Could not attach the image.");
  return ok();
}

export async function deleteJournalImage(
  imageId: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthedContext();
  if (!user) return fail("unauthorized", "Please sign in.");
  const { error } = await supabase
    .from("journal_images")
    .delete()
    .eq("id", imageId);
  if (error) return fail("server_error", "Could not remove the image.");
  return ok();
}
