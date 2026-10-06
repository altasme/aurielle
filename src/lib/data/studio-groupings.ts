import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";

// The Customisation Studio's groupings, admin-editable via Website
// Management (see src/lib/admin/studio-content.ts) -- DB-backed, same
// pattern as products/promotions, not the site_text_fields "code
// default + override" pattern, since this is structured, repeating
// data (a variable-length item list per grouping).
//
// spotlight: true groupings are the only ones allowed on the
// homepage (luxury face only -- fridge magnets etc. stay inside the
// Studio page, never the front door).
export type StudioGrouping = {
  slug: string;
  name: string;
  spotlight: boolean;
  intro: string;
  items: string[];
  image?: string;
  imageBrief: string;
  // Per-item photos, keyed by the exact string in `items`. Not every
  // item needs an entry -- StudioGroupingGallery falls back to
  // `image` (or a placeholder) for items without one yet.
  itemImages?: Record<string, string>;
};

type GroupingRow = {
  slug: string;
  name: string;
  intro: string;
  spotlight: boolean;
  image_url: string | null;
  image_brief: string;
  sort_order: number;
  studio_grouping_items: { label: string; image_url: string | null; sort_order: number }[] | null;
};

function mapRow(row: GroupingRow): StudioGrouping {
  const items = [...(row.studio_grouping_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const itemImages: Record<string, string> = {};
  for (const item of items) {
    if (item.image_url) itemImages[item.label] = item.image_url;
  }
  return {
    slug: row.slug,
    name: row.name,
    spotlight: row.spotlight,
    intro: row.intro,
    items: items.map((item) => item.label),
    image: row.image_url ?? undefined,
    imageBrief: row.image_brief,
    itemImages: Object.keys(itemImages).length > 0 ? itemImages : undefined,
  };
}

export async function getStudioGroupings(): Promise<StudioGrouping[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("studio_groupings")
    .select("slug, name, intro, spotlight, image_url, image_brief, sort_order, studio_grouping_items(label, image_url, sort_order)")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(`Failed to load studio groupings: ${error.message}`);
  return (data ?? []).map((row) => mapRow(row as unknown as GroupingRow));
}
