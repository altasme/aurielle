import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | undefined;

// Service-role client. Bypasses Row Level Security. Server-only:
// importing this from a client component fails the build. Used for
// order/inquiry writes, proof-of-payment uploads, the admin panel
// (src/lib/admin/), and the public catalogue reads in src/lib/data/
// (admin-panel pivot: the catalogue is DB-backed again, not static) --
// never expose this key to the browser.
//
// Built lazily on first call, never at module scope: Next's build step
// imports every route module to inspect its exports, which previously
// ran before Cloudflare's build container had env vars attached, so a
// module-scope createClient() call crashed the build with "supabaseUrl
// is required". generateStaticParams() on the catalogue pages now also
// calls this at build time, so the build environment must have
// SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY set for `next build` to
// succeed, not just for the deployed Worker.
export function getSupabaseAdminClient(): SupabaseClient {
  if (!cachedAdminClient) {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceRoleKey) {
      throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
    }
    cachedAdminClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false },
    });
  }
  return cachedAdminClient;
}
