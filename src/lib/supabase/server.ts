import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedAdminClient: SupabaseClient | undefined;

// Write-only service-role client (spec v4 §Architecture). Bypasses Row
// Level Security. Server-only: importing this from a client component
// fails the build. Use for order/inquiry writes and proof-of-payment
// uploads; never expose this key to the browser.
//
// Built lazily on first call, inside write handlers only, never at
// module scope: Next's build step imports every route module to inspect
// its exports, which previously ran before Cloudflare's build container
// had env vars attached, so a module-scope createClient() call crashed
// the build with "supabaseUrl is required". No read path imports this
// client at all anymore (catalogue is static, see src/lib/data/), so
// that failure mode is gone regardless, but the lazy pattern stays as
// the correct default for any server-only client.
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
