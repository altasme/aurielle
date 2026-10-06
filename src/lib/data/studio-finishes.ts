import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// The Studio's finishes strip: what the printer can do, shown as
// representative sample tiles. Admin-editable via Website Management
// (see src/lib/admin/studio-content.ts) -- DB-backed, same pattern as
// products/promotions.
export type StudioFinish = {
  name: string;
  description: string;
  image?: string;
};

type FinishRow = { name: string; description: string; image_url: string | null };

export async function getStudioFinishes(): Promise<StudioFinish[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("studio_finishes")
    .select("name, description, image_url")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Failed to load studio finishes: ${error.message}`);
  return (data ?? []).map((row: FinishRow) => ({
    name: row.name,
    description: row.description,
    image: row.image_url ?? undefined,
  }));
}
