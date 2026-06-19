import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/db";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// Server-side Supabase client bound to the request cookies (Next.js 15: cookies() is
// async). Runs every query under the user's RLS context. Never uses the service role.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render: cookies are read-only there.
            // The middleware refreshes the session, so this is safe to ignore.
          }
        },
      },
    },
  );
}

// Derive the client type from the factory so it always matches what is returned
// (avoids @supabase/ssr vs supabase-js generic-arity skew).
export type SupabaseServerClient = Awaited<
  ReturnType<typeof createSupabaseServerClient>
>;

// True only when Supabase env vars are present. Lets public pages degrade gracefully
// (e.g. show an empty journal feed) when running locally without a configured project.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
