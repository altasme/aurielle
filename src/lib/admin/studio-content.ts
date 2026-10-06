import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";
import { putImage, deleteImages, r2PublicUrl } from "@/lib/admin/r2";

// Admin CRUD for the Customisation Studio's groupings/items and finish
// tiles (supabase/migrations/0021_studio_content.sql) -- the editable
// backend for src/lib/data/studio-groupings.ts / studio-finishes.ts,
// which the public home/studio pages read from. Same admin-authored
// pattern as src/lib/admin/products.ts.

export type AdminStudioGrouping = {
  id: string;
  slug: string;
  name: string;
  intro: string;
  spotlight: boolean;
  imageUrl: string | null;
  imageBrief: string;
  sortOrder: number;
};

export type AdminStudioGroupingItem = {
  id: string;
  label: string;
  imageUrl: string | null;
  sortOrder: number;
};

export type AdminStudioFinish = {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  sortOrder: number;
};

function mapGrouping(row: {
  id: string;
  slug: string;
  name: string;
  intro: string;
  spotlight: boolean;
  image_url: string | null;
  image_brief: string;
  sort_order: number;
}): AdminStudioGrouping {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    intro: row.intro,
    spotlight: row.spotlight,
    imageUrl: row.image_url,
    imageBrief: row.image_brief,
    sortOrder: row.sort_order,
  };
}

function mapItem(row: { id: string; label: string; image_url: string | null; sort_order: number }): AdminStudioGroupingItem {
  return { id: row.id, label: row.label, imageUrl: row.image_url, sortOrder: row.sort_order };
}

function mapFinish(row: {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  sort_order: number;
}): AdminStudioFinish {
  return { id: row.id, name: row.name, description: row.description, imageUrl: row.image_url, sortOrder: row.sort_order };
}

// ---- Groupings ----

export async function listGroupings(): Promise<AdminStudioGrouping[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("studio_groupings")
    .select("id, slug, name, intro, spotlight, image_url, image_brief, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to list studio groupings: ${error.message}`);
  return (data ?? []).map(mapGrouping);
}

export async function getGrouping(id: string): Promise<AdminStudioGrouping | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("studio_groupings")
    .select("id, slug, name, intro, spotlight, image_url, image_brief, sort_order")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load studio grouping: ${error.message}`);
  return data ? mapGrouping(data) : null;
}

async function uniqueGroupingSlug(name: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const base = slugify(name) || "grouping";
  let candidate = base;
  let suffix = 2;
  for (;;) {
    const { data } = await supabase.from("studio_groupings").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export type GroupingInput = { name: string; intro: string; imageBrief: string; spotlight: boolean };

export async function createGrouping(input: GroupingInput): Promise<{ id: string }> {
  const supabase = getSupabaseAdminClient();
  const slug = await uniqueGroupingSlug(input.name);
  const { data: maxRow } = await supabase
    .from("studio_groupings")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("studio_groupings")
    .insert({
      slug,
      name: input.name,
      intro: input.intro,
      image_brief: input.imageBrief,
      spotlight: input.spotlight,
      sort_order: sortOrder,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(`Failed to create studio grouping: ${error?.message}`);
  return { id: data.id };
}

export async function updateGrouping(id: string, input: GroupingInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("studio_groupings")
    .update({ name: input.name, intro: input.intro, image_brief: input.imageBrief, spotlight: input.spotlight })
    .eq("id", id);
  if (error) throw new Error(`Failed to update studio grouping: ${error.message}`);
}

function r2KeyFromUrl(url: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base || !url.startsWith(`${base}/`)) return null;
  return url.slice(base.length + 1);
}

export async function uploadGroupingImage(id: string, file: Blob): Promise<{ url: string }> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("studio_groupings").select("image_url").eq("id", id).maybeSingle();

  const key = `studio/groupings/${id}/main`;
  await putImage(key, file);
  const url = r2PublicUrl(key);

  const { error } = await supabase.from("studio_groupings").update({ image_url: url }).eq("id", id);
  if (error) throw new Error(`Failed to save grouping image: ${error.message}`);

  // Best-effort: only cleans up a previous R2 upload under this same
  // key, which the overwrite above already replaced -- a static
  // /images/... default never needs deleting.
  const oldKey = existing?.image_url ? r2KeyFromUrl(existing.image_url) : null;
  if (oldKey && oldKey !== key) await deleteImages([oldKey]).catch(() => {});

  return { url };
}

export async function deleteGrouping(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data: grouping } = await supabase.from("studio_groupings").select("image_url").eq("id", id).maybeSingle();
  const { data: items } = await supabase.from("studio_grouping_items").select("image_url").eq("grouping_id", id);

  const { error } = await supabase.from("studio_groupings").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete studio grouping: ${error.message}`);

  const keys = [grouping?.image_url, ...(items ?? []).map((i) => i.image_url)]
    .map((url) => (url ? r2KeyFromUrl(url) : null))
    .filter((k): k is string => Boolean(k));
  if (keys.length > 0) await deleteImages(keys).catch(() => {});
}

// ---- Grouping items ----

export async function listGroupingItems(groupingId: string): Promise<AdminStudioGroupingItem[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("studio_grouping_items")
    .select("id, label, image_url, sort_order")
    .eq("grouping_id", groupingId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to list grouping items: ${error.message}`);
  return (data ?? []).map(mapItem);
}

export async function createGroupingItem(groupingId: string, label: string): Promise<AdminStudioGroupingItem> {
  const supabase = getSupabaseAdminClient();
  const { data: maxRow } = await supabase
    .from("studio_grouping_items")
    .select("sort_order")
    .eq("grouping_id", groupingId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("studio_grouping_items")
    .insert({ grouping_id: groupingId, label, sort_order: sortOrder })
    .select("id, label, image_url, sort_order")
    .single();
  if (error || !data) throw new Error(`Failed to create item: ${error?.message}`);
  return mapItem(data);
}

export async function updateGroupingItemLabel(itemId: string, label: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("studio_grouping_items").update({ label }).eq("id", itemId);
  if (error) throw new Error(`Failed to update item: ${error.message}`);
}

export async function reorderGroupingItems(groupingId: string, orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const results = await Promise.all(
    orderedIds.map((itemId, index) =>
      supabase.from("studio_grouping_items").update({ sort_order: index }).eq("id", itemId).eq("grouping_id", groupingId),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`Failed to reorder items: ${failed.error.message}`);
}

export async function uploadGroupingItemImage(itemId: string, file: Blob): Promise<{ url: string }> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("studio_grouping_items").select("image_url").eq("id", itemId).maybeSingle();

  const key = `studio/grouping-items/${itemId}`;
  await putImage(key, file);
  const url = r2PublicUrl(key);

  const { error } = await supabase.from("studio_grouping_items").update({ image_url: url }).eq("id", itemId);
  if (error) throw new Error(`Failed to save item image: ${error.message}`);

  const oldKey = existing?.image_url ? r2KeyFromUrl(existing.image_url) : null;
  if (oldKey && oldKey !== key) await deleteImages([oldKey]).catch(() => {});

  return { url };
}

export async function deleteGroupingItem(itemId: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("studio_grouping_items").select("image_url").eq("id", itemId).maybeSingle();
  const { error } = await supabase.from("studio_grouping_items").delete().eq("id", itemId);
  if (error) throw new Error(`Failed to delete item: ${error.message}`);

  const oldKey = existing?.image_url ? r2KeyFromUrl(existing.image_url) : null;
  if (oldKey) await deleteImages([oldKey]).catch(() => {});
}

// ---- Finishes ----

export async function listFinishes(): Promise<AdminStudioFinish[]> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("studio_finishes")
    .select("id, name, description, image_url, sort_order")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`Failed to list studio finishes: ${error.message}`);
  return (data ?? []).map(mapFinish);
}

export type FinishInput = { name: string; description: string };

export async function createFinish(input: FinishInput): Promise<AdminStudioFinish> {
  const supabase = getSupabaseAdminClient();
  const { data: maxRow } = await supabase
    .from("studio_finishes")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("studio_finishes")
    .insert({ name: input.name, description: input.description, sort_order: sortOrder })
    .select("id, name, description, image_url, sort_order")
    .single();
  if (error || !data) throw new Error(`Failed to create finish: ${error?.message}`);
  return mapFinish(data);
}

export async function updateFinish(id: string, input: FinishInput): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("studio_finishes")
    .update({ name: input.name, description: input.description })
    .eq("id", id);
  if (error) throw new Error(`Failed to update finish: ${error.message}`);
}

export async function reorderFinishes(orderedIds: string[]): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const results = await Promise.all(
    orderedIds.map((id, index) => supabase.from("studio_finishes").update({ sort_order: index }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`Failed to reorder finishes: ${failed.error.message}`);
}

export async function uploadFinishImage(id: string, file: Blob): Promise<{ url: string }> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("studio_finishes").select("image_url").eq("id", id).maybeSingle();

  const key = `studio/finishes/${id}`;
  await putImage(key, file);
  const url = r2PublicUrl(key);

  const { error } = await supabase.from("studio_finishes").update({ image_url: url }).eq("id", id);
  if (error) throw new Error(`Failed to save finish image: ${error.message}`);

  const oldKey = existing?.image_url ? r2KeyFromUrl(existing.image_url) : null;
  if (oldKey && oldKey !== key) await deleteImages([oldKey]).catch(() => {});

  return { url };
}

export async function deleteFinish(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase.from("studio_finishes").select("image_url").eq("id", id).maybeSingle();
  const { error } = await supabase.from("studio_finishes").delete().eq("id", id);
  if (error) throw new Error(`Failed to delete finish: ${error.message}`);

  const oldKey = existing?.image_url ? r2KeyFromUrl(existing.image_url) : null;
  if (oldKey) await deleteImages([oldKey]).catch(() => {});
}
