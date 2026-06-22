import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/db";

// Service-role client (SERVER ONLY — never import into client code). Bypasses RLS, so use
// it sparingly and only after verifying the caller. Needed for actions the user can't do
// with their own session, e.g. deleting their own auth account.

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
