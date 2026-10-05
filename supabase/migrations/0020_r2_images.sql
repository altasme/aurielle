-- Migrating product/site-content photos off Cloudinary onto Cloudflare
-- R2 (scripts/migrate-images-to-r2.mjs does the actual file move; this
-- migration only prepares the schema for it).
--
-- product_images: r2_key is a new, nullable column -- the prefix under
-- which a row's two pre-sized variants live in the bucket
-- (`${r2_key}/full.webp`, `${r2_key}/thumb.webp}`; see src/lib/admin/r2.ts
-- and src/lib/product-image-url.ts). cloudinary_public_id/cloudinary_url
-- drop their NOT NULL constraint because new uploads (src/app/api/admin/
-- products/[id]/images/route.ts) now write r2_key instead and leave
-- both Cloudinary columns null. Existing rows keep their Cloudinary
-- values untouched until the migration script backfills r2_key for
-- them; src/lib/product-image-url.ts reads r2_key when present and
-- falls back to the Cloudinary columns otherwise, so nothing breaks
-- mid-migration.
alter table product_images add column if not exists r2_key text;
alter table product_images alter column cloudinary_public_id drop not null;
alter table product_images alter column cloudinary_url drop not null;

-- site_image_slots needs no schema change: image_url already holds
-- "whatever the public page should render" (a static /images/... path
-- or a Cloudinary secure_url) -- new uploads now put the R2 public URL
-- there instead, and cloudinary_public_id (already nullable) stays
-- null for them.
