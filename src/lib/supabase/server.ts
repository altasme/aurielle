import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | undefined;

// Service-role client: bypasses Row Level Security. Server-only —
// importing this from a client component fails the build. Use for admin
// CMS writes and order creation; never expose this key to the browser.
//
// Built lazily on first call, not at module scope — see the comment in
// ../supabase/client.ts for why (Cloudflare build-time module evaluation
// crash otherwise).
export function getSupabaseAdminClient(): SupabaseClient {
  if (!cachedAdminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error(
        "Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
      );
    }
    cachedAdminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return cachedAdminClient;
}
