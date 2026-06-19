import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { JournalBody } from "@/features/journal/components/journal-body";
import { JournalImage } from "@/features/journal/components/journal-image";
import {
  createSupabaseServerClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { getOptionalUser } from "@/lib/auth/session";
import { routes } from "@/constants/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!isSupabaseConfigured) return {};
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("journals")
    .select("title, excerpt")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return {};
  return { title: data.title, description: data.excerpt ?? undefined };
}

export default async function JournalDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isSupabaseConfigured) notFound();
  const supabase = await createSupabaseServerClient();

  const { data: journal } = await supabase
    .from("journals")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (!journal || journal.deleted_at) notFound();

  const { data: images } = await supabase
    .from("journal_images")
    .select("*")
    .eq("journal_id", journal.id)
    .order("position", { ascending: true });

  const user = await getOptionalUser();
  const isOwner = user?.id === journal.user_id;

  return (
    <article className="pt-16 md:pt-20">
      <PageContainer width="default" className="section-y">
        <div className="mx-auto max-w-prose">
          <p className="text-xs uppercase tracking-[0.18em] text-accent-goldText">
            {journal.author_label}
          </p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl">
            {journal.title}
          </h1>
          {journal.excerpt && (
            <p className="mt-3 text-lg text-muted-foreground">{journal.excerpt}</p>
          )}
          {isOwner && (
            <div className="mt-4">
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <Link href={routes.journalEdit(journal.slug)}>
                  <Pencil className="size-4" />
                  Edit
                </Link>
              </Button>
            </div>
          )}
        </div>

        {journal.cover_path && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-lg bg-surface-2">
            <JournalImage
              path={journal.cover_path}
              isSeed={journal.is_seed}
              alt={journal.title}
              width={1280}
              height={720}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-10 max-w-prose">
          <JournalBody markdown={journal.body} />
        </div>

        {images && images.length > 0 && (
          <div className="mx-auto mt-10 grid max-w-prose grid-cols-2 gap-3">
            {images.map((img) => (
              <div
                key={img.id}
                className="relative aspect-square overflow-hidden rounded-md bg-surface-2"
              >
                <JournalImage
                  path={img.storage_path}
                  isSeed={journal.is_seed}
                  alt={img.alt ?? journal.title}
                  width={500}
                  height={500}
                  fill
                  sizes="(max-width: 768px) 50vw, 320px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </article>
  );
}
