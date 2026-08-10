import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Anon-key client: safe for use in server components and client
// components alike. Respects Row Level Security — only reaches the
// public read policies defined in supabase/migrations/0001_init.sql.
export const supabase = createClient(url, anonKey);
