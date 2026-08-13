import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | undefined;

// Anon-key client: safe for use in server components and client
// components alike. Respects Row Level Security — only reaches the
// public read policies defined in supabase/migrations/0001_init.sql.
//
// Built lazily on first call rather than at module scope: Next's build
// step imports every route module to inspect its exports (e.g. `export
// const dynamic`), and on Cloudflare that happens before env vars are
// attached to the request — a module-scope `createClient()` call would
// crash the build with "supabaseUrl is required" even though the app
// never needed a real client at that point.
export function getSupabaseClient(): SupabaseClient {
  if (!cachedClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY",
      );
    }
    cachedClient = createClient(url, anonKey);
  }
  return cachedClient;
}
