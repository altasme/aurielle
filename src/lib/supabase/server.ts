import "server-only";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Service-role client: bypasses Row Level Security. Server-only —
// importing this from a client component fails the build. Use for admin
// CMS writes and order creation; never expose this key to the browser.
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
