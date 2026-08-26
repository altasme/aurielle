-- Promotions: two independent mechanisms per business line
-- (aurielle_collection / atelier_supply), never both applied to the
-- same order (a discount code always overrides any auto-applied
-- product promotions for that order -- see src/lib/promotions/apply.ts).
--
-- 1. Product Promotions ("promotions" + join tables): admin picks
--    specific products, and for atelier_supply, whole product types
--    (item groups like "Boxes", "Pouches") too. Applies automatically
--    at checkout, no code needed, discounted per matching line item.
-- 2. Discount codes ("discount_codes"): a short code the customer
--    types in at checkout, discounting the whole order.
--
-- Both share the same "is this currently usable" shape: an admin
-- on/off switch on top of a date range and an optional use-count cap,
-- so a campaign can be paused without losing its configured dates.

create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('aurielle_collection', 'atelier_supply')),
  name text not null,
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_uses int,
  used_count int not null default 0,
  min_spend numeric(10,2),
  internal_notes text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index if not exists promotions_category_idx on promotions (category);

-- Specific products a promotion discounts.
create table if not exists promotion_products (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  unique (promotion_id, product_id)
);
create index if not exists promotion_products_product_id_idx on promotion_products (product_id);

-- Whole item groups (product_types) a promotion discounts -- only
-- meaningful for atelier_supply, since aurielle_collection products
-- have no product_type_id (see products_category_fields in
-- 0005_admin_panel.sql). A product matches a promotion if it's listed
-- directly in promotion_products OR its product_type_id is listed here.
create table if not exists promotion_product_types (
  id uuid primary key default gen_random_uuid(),
  promotion_id uuid not null references promotions(id) on delete cascade,
  product_type_id uuid not null references product_types(id) on delete cascade,
  unique (promotion_id, product_type_id)
);
create index if not exists promotion_product_types_product_type_id_idx on promotion_product_types (product_type_id);

create table if not exists discount_codes (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('aurielle_collection', 'atelier_supply')),
  name text not null,
  code text not null,
  discount_type text not null check (discount_type in ('fixed', 'percent')),
  discount_value numeric(10,2) not null check (discount_value > 0),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  max_uses int,
  used_count int not null default 0,
  min_spend numeric(10,2),
  internal_notes text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (char_length(code) between 1 and 6)
);
-- Scoped per category, not globally: Collection and Atelier Supply are
-- independent checkouts, so the same short code text is allowed to
-- exist once in each without ambiguity.
create unique index if not exists discount_codes_category_code_idx on discount_codes (category, code);

-- ============================================================
-- Discount tracking on orders/order_items. Existing columns
-- (order_items.unit_price/line_subtotal, orders.subtotal) keep their
-- current meaning -- the original, undiscounted catalogue price --
-- so nothing that already reads them needs to change. Discounts are
-- additive on top, in their own columns.
-- ============================================================

-- Which product promotion (if any) discounted this line, and by how
-- much, in currency units for the full line (already multiplied by
-- quantity) -- not a percentage, so admin/order views don't need to
-- re-derive the amount from a stored rate.
alter table order_items add column if not exists promotion_id uuid references promotions(id) on delete set null;
alter table order_items add column if not exists promotion_discount_amount numeric(10,2) not null default 0;

-- A discount code is order-wide, at most one per order (codes don't
-- stack with anything, including each other).
alter table orders add column if not exists discount_code_id uuid references discount_codes(id) on delete set null;
alter table orders add column if not exists discount_code_amount numeric(10,2) not null default 0;
-- Sum of every line's promotion_discount_amount, denormalized onto the
-- order for a cheap total-discount read without joining order_items.
alter table orders add column if not exists promotion_discount_total numeric(10,2) not null default 0;

-- Atomic increments for used_count, called once per order at checkout
-- (src/lib/promotions/apply.ts) -- a plain read-then-write from the
-- application would race under concurrent checkouts of the last few
-- remaining uses.
create or replace function increment_promotion_usage(promo_id uuid) returns void as $$
  update promotions set used_count = used_count + 1 where id = promo_id;
$$ language sql;

create or replace function increment_discount_code_usage(code_id uuid) returns void as $$
  update discount_codes set used_count = used_count + 1 where id = code_id;
$$ language sql;

alter table promotions enable row level security;
alter table promotion_products enable row level security;
alter table promotion_product_types enable row level security;
alter table discount_codes enable row level security;
-- No public policies: the admin panel manages these with the service
-- role, and checkout's discount matching (src/lib/promotions/apply.ts)
-- runs server-side inside /api/orders, also with the service role --
-- same pattern as every other write/read in this app. The public site
-- never queries these tables directly.
