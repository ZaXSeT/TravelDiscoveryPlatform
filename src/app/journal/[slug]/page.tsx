import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { JournalBody } from "@/features/journal/components/journal-body";
import { JournalImage } from "@/features/journal/components/journal-image";
import { JournalGallery } from "@/features/journal/components/journal-gallery";
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
    <article className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[500px] md:h-[70vh] md:min-h-[600px] flex flex-col justify-end">
        {journal.cover_path ? (
          <JournalImage
            path={journal.cover_path}
            isSeed={journal.is_seed}
            alt={journal.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
        )}
        {/* Stronger gradient overlay for readability: dark at bottom for text, dark at top for navbar */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/90" />
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full pt-32 pb-12 md:pb-16">
          <PageContainer width="default" className="w-full px-4">
            <div className="max-w-4xl">
              <Link 
                href={`/profile/${journal.user_id}`}
                className="inline-block hover:opacity-80 transition-opacity"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent-gold drop-shadow-md">
                  By {journal.author_label}
                </p>
              </Link>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-white drop-shadow-lg">
                {journal.title}
              </h1>
              {journal.excerpt && (
                <p className="mt-6 max-w-2xl text-base sm:text-lg md:text-xl font-light text-white/90 leading-relaxed drop-shadow-md">
                  {journal.excerpt}
                </p>
              )}
              {isOwner && (
                <div className="mt-8 flex justify-start">
                  <Button asChild variant="outline" size="sm" className="gap-1.5 rounded-full px-6 bg-white/10 text-white border-white/20 hover:bg-white hover:text-black backdrop-blur-sm">
                    <Link href={routes.journalEdit(journal.slug)}>
                      <Pencil className="size-4" />
                      Edit Journal
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </PageContainer>
        </div>
      </div>

      {/* Body Section */}
      <PageContainer width="default" className="py-12 md:py-20">
        <div className="mx-auto max-w-prose">
          <JournalBody markdown={journal.body} />
        </div>

        <JournalGallery 
          images={images || []} 
          isSeed={journal.is_seed} 
          journalTitle={journal.title} 
        />
      </PageContainer>
    </article>
  );
}
