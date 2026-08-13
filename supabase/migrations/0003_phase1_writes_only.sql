-- Phase 1 pivot (spec v4): the catalogue is static, generated at build
-- time from data/*.csv (see scripts/generate-catalogue.mjs). It no
-- longer lives in, or gets read from, this database. Supabase is
-- writes-only in Phase 1: orders, order_items, and inquiries.

-- No public read path exists anymore (no anon client in the app), so
-- there's nothing left for these policies to serve. Revoking public
-- read access is the correct default now, not just an optimization.
drop policy if exists "Public can read perfumes" on perfumes;
drop policy if exists "Public can read available supply materials" on supply_materials;

-- order_items previously FK'd to perfumes/supply_materials. Those tables
-- are no longer the source of truth for the catalogue (git/CSV is), so a
-- hard FK doesn't make sense: order lines are fully snapshotted instead
-- (name, price, unit) exactly as spec §15/§20 requires: "later catalogue
-- edits never alter historical orders."
alter table order_items drop constraint if exists order_items_one_product;
alter table order_items drop column if exists perfume_id;
alter table order_items drop column if exists supply_material_id;

alter table order_items
  add column if not exists product_type text
    check (product_type in ('perfume', 'supply_material')),
  add column if not exists catalogue_slug text,
  add column if not exists serial_number int,
  add column if not exists currency text,
  add column if not exists pricing_unit text;

alter table order_items alter column product_type set not null;

-- Match the field name used throughout spec v4 §20.
alter table orders rename column proof_of_payment_url to proof_url;
