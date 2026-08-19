-- Admin panel refinement round 2 (client feedback after first live use).
--
-- 1. Atelier Supply's product types become real organizational
--    sub-menus (Fragrances / Bottles / Pouches / Boxes / Labels),
--    chosen once when a product is added rather than an editable field
--    on the edit form. Seed the four new ones; every pre-admin-panel
--    Atelier Supply product (the 0006 backfill) is, in fact, a
--    fragrance -- that's the entire content of the original price
--    list this app was built from -- so backfill those rows too.
insert into product_types (category, name, is_system) values
  ('atelier_supply', 'Fragrances', true),
  ('atelier_supply', 'Bottles', true),
  ('atelier_supply', 'Pouches', true),
  ('atelier_supply', 'Boxes', true),
  ('atelier_supply', 'Labels', true)
on conflict (category, name) do nothing;

update products
set product_type_id = (
  select id from product_types where category = 'atelier_supply' and name = 'Fragrances'
)
where category = 'atelier_supply' and product_type_id is null;

-- 2. Mood becomes admin-extensible: any value, not a fixed 5-item
--    enum, using the same free-text-with-suggestions pattern already
--    used for Scent Tags rather than a separate managed list. Drops
--    the fixed CHECK constraint from 0005; the column itself is
--    unchanged (still nullable text).
alter table products drop constraint products_mood_check;
