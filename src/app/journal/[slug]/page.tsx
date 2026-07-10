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
    <article className="min-h-screen">
      {/* Hero Section */}
      <div className="relative w-full h-[60vh] min-h-[500px] md:h-[75vh] md:min-h-[600px] flex flex-col justify-center items-center text-center">
        {/* Parallax Background */}
        <div className="fixed top-0 left-0 w-full h-[60vh] min-h-[500px] md:h-[75vh] md:min-h-[600px] z-0 pointer-events-none">
          {journal.cover_path ? (
            <JournalImage
              path={journal.cover_path}
              isSeed={journal.is_seed}
              alt={journal.title}
              fill
              priority
              sizes="100vw"
              className="object-cover absolute inset-0"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-2 to-surface-1" />
          )}
          {/* Subtle, soft cinematic vignette overlay */}
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>
        
        {/* Hero Content Overlay */}
        <div className="relative z-10 w-full pt-32 pb-16 px-6 md:px-12 lg:px-24 flex flex-col justify-end">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-4 mb-6">
              <Link 
                href={`/profile/${journal.user_id}`}
                className="hover:opacity-80 transition-opacity"
              >
                <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-accent-gold drop-shadow-md">
                  {journal.author_label}
                </p>
              </Link>
              {journal.created_at && (
                <>
                  <span className="text-white/40 text-xs">•</span>
                  <p className="text-xs md:text-sm font-medium uppercase tracking-widest text-white/80 drop-shadow-md">
                    {new Date(journal.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </>
              )}
            </div>
            
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05] tracking-tight text-white drop-shadow-lg text-balance">
              {journal.title}
            </h1>
            
            {journal.excerpt && (
              <p className="mt-8 max-w-2xl text-lg md:text-2xl font-light text-white/90 leading-relaxed drop-shadow-md">
                {journal.excerpt}
              </p>
            )}

            {isOwner && (
              <div className="mt-10">
                <Button asChild variant="outline" className="gap-2 rounded-full px-8 py-6 bg-white/5 text-white border-white/20 hover:bg-white hover:text-black backdrop-blur-md transition-all">
                  <Link href={routes.journalEdit(journal.slug)}>
                    <Pencil className="size-4" />
                    Edit Journal
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body Section */}
      <div className="relative z-10 bg-background">
        <PageContainer width="default" className="py-16 md:py-24">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start max-w-6xl mx-auto">
            {/* Left Column: Story Text */}
            <div className="w-full lg:w-2/3">
              <JournalBody markdown={journal.body} />
              
              <div className="mt-16 flex items-center justify-center">
                <div className="h-px w-12 bg-border"></div>
                <p className="mx-4 text-sm tracking-widest text-muted-foreground uppercase font-medium">Fin</p>
                <div className="h-px w-12 bg-border"></div>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-sm text-muted-foreground font-light italic">
                  Written by <span className="font-semibold not-italic text-foreground">{journal.author_label}</span>
                </p>
              </div>
            </div>

            {/* Right Column: Sticky Photo Gallery */}
            <div className="w-full lg:w-1/3 lg:sticky lg:top-32">
              <JournalGallery 
                images={images || []} 
                isSeed={journal.is_seed} 
                journalTitle={journal.title} 
                className="grid grid-cols-2 lg:grid-cols-1 gap-4"
              />
            </div>
          </div>
        </PageContainer>
      </div>
    </article>
  );
}
