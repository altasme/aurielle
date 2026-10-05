import "server-only";
import { revalidatePath } from "next/cache";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import { deleteImage as deleteCloudinaryImage } from "@/lib/admin/cloudinary";
import { putImage, deleteImages as deleteR2Images, r2PublicUrl } from "@/lib/admin/r2";
import { getPageSchema, resolvePageContent, SITE_CONTENT_PAGES, type TextFieldDef, type ImageSlotDef } from "@/lib/site-content";

export type EditableTextField = TextFieldDef & { value: string };
export type EditableImageSlot = ImageSlotDef & { value: string };

export type PageContentForEdit = {
  slug: string;
  label: string;
  description: string;
  textFields: EditableTextField[];
  imageSlots: EditableImageSlot[];
};

export async function getSiteContentForEdit(page: string): Promise<PageContentForEdit | null> {
  const schema = getPageSchema(page);
  if (!schema) return null;

  const { text, images } = await resolvePageContent(page);
  return {
    slug: schema.slug,
    label: schema.label,
    description: schema.description,
    textFields: schema.textFields.map((field) => ({ ...field, value: text[field.key] })),
    imageSlots: schema.imageSlots.map((slot) => ({ ...slot, value: images[slot.key] })),
  };
}

// The Atelier Supply capability cards are also rendered on the
// Homepage (src/lib/data/atelier-capabilities.ts's shared usage,
// carried over into the CMS as the atelier-supply page's
// capability_*_title/body fields) -- so an edit there needs to
// refresh both pages, not just its own.
const EXTRA_REVALIDATE_PATHS: Record<string, string[]> = {
  "atelier-supply": ["/"],
};

function revalidateSiteContentPage(page: string): void {
  revalidatePath(`/${page === "home" ? "" : page}`);
  for (const path of EXTRA_REVALIDATE_PATHS[page] ?? []) revalidatePath(path);
}

export class UnknownFieldError extends Error {}

export async function updateTextField(page: string, fieldKey: string, value: string): Promise<void> {
  const schema = getPageSchema(page);
  if (!schema?.textFields.some((f) => f.key === fieldKey)) {
    throw new UnknownFieldError(`Unknown text field "${fieldKey}" for page "${page}"`);
  }

  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("site_text_fields")
    .upsert({ page, field_key: fieldKey, value, updated_at: new Date().toISOString() }, { onConflict: "page,field_key" });
  if (error) throw new Error(`Failed to save text field: ${error.message}`);

  revalidateSiteContentPage(page);
}

// Reverts one field back to its code-side default by simply removing
// the override row -- resolvePageContent() falls back to the schema
// default the moment no row exists.
export async function resetTextField(page: string, fieldKey: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("site_text_fields").delete().eq("page", page).eq("field_key", fieldKey);
  if (error) throw new Error(`Failed to reset text field: ${error.message}`);
  revalidateSiteContentPage(page);
}

export async function uploadImageSlot(page: string, slotKey: string, file: Blob): Promise<{ url: string }> {
  const schema = getPageSchema(page);
  const slotDef = schema?.imageSlots.find((s) => s.key === slotKey);
  if (!slotDef) throw new UnknownFieldError(`Unknown image slot "${slotKey}" for page "${page}"`);

  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("site_image_slots")
    .select("cloudinary_public_id")
    .eq("page", page)
    .eq("slot_key", slotKey)
    .maybeSingle();

  // Deterministic key: a reupload overwrites the same R2 object in
  // place, so unlike Cloudinary there's no separate asset to clean up
  // on this (non-legacy) path.
  const r2Key = `site-content/${page}/${slotKey}.webp`;
  await putImage(r2Key, file);
  const url = r2PublicUrl(r2Key);

  const { error } = await supabase.from("site_image_slots").upsert(
    {
      page,
      slot_key: slotKey,
      image_url: url,
      cloudinary_public_id: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "page,slot_key" },
  );
  if (error) throw new Error(`Failed to save image slot: ${error.message}`);

  // Best-effort cleanup of a legacy Cloudinary photo this slot had
  // before the R2 migration -- a failure here would only leave an
  // orphaned Cloudinary asset, never break the save the admin is
  // waiting on.
  if (existing?.cloudinary_public_id) {
    await deleteCloudinaryImage(existing.cloudinary_public_id).catch(() => {});
  }

  revalidateSiteContentPage(page);
  return { url };
}

// Reverts an image slot back to the site's original photo -- deletes
// whatever asset this slot had (R2 object or, pre-migration, a
// Cloudinary one) and the override row, so resolvePageContent() falls
// back to the schema's default /images/... path again.
export async function resetImageSlot(page: string, slotKey: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { data: existing } = await supabase
    .from("site_image_slots")
    .select("cloudinary_public_id")
    .eq("page", page)
    .eq("slot_key", slotKey)
    .maybeSingle();

  const { error } = await supabase.from("site_image_slots").delete().eq("page", page).eq("slot_key", slotKey);
  if (error) throw new Error(`Failed to reset image slot: ${error.message}`);

  if (existing?.cloudinary_public_id) {
    await deleteCloudinaryImage(existing.cloudinary_public_id).catch(() => {});
  } else {
    await deleteR2Images([`site-content/${page}/${slotKey}.webp`]).catch(() => {});
  }

  revalidateSiteContentPage(page);
}

export function listPageSummaries(): { slug: string; label: string; description: string }[] {
  return SITE_CONTENT_PAGES.map(({ slug, label, description }) => ({ slug, label, description }));
}
