-- Admin panel (MVP spec, admin.aurielle.altasme.com): authenticated
-- product & pricing management, backed by a shared product schema
-- rather than separate Aurielle/Atelier systems (spec §18).
--
-- This is a deliberate architecture pivot from migration 0003's
-- "catalogue is static, generated from CSV" decision: the admin panel
-- is now the source of truth, and the public site reads live from
-- these tables (see src/lib/data/perfumes.ts and supply-materials.ts).
-- The legacy `perfumes` / `supply_materials` tables are left in place,
-- unused, rather than dropped -- no destructive action on tables that
-- predate this decision.

create extension if not exists "pgcrypto";

-- ============================================================
-- ADMIN AUTH: a dedicated admin_users table (not Supabase Auth), per
-- spec §1/§17. Passwords are scrypt-hashed (node:crypto, no extra
-- dependency, Workers-compatible via nodejs_compat) -- never plaintext.
-- Sessions store only a hash of the session token, never the raw
-- token, so a DB read alone can't be used to impersonate a session.
-- ============================================================
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references admin_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_sessions_token_hash_idx on admin_sessions (token_hash);
create index if not exists admin_sessions_expires_at_idx on admin_sessions (expires_at);

-- ============================================================
-- PRODUCT TYPES: admin-extensible categories for Atelier Supply
-- (spec §9 "the system must also support user-created product
-- types"). Aurielle Collection's "Type" field is a fixed dropdown
-- (Perfume Oil / Waterbased) per spec §5, not this table.
-- ============================================================
create table if not exists product_types (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('atelier_supply')),
  name text not null,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  unique (category, name)
);

-- ============================================================
-- PRODUCTS: shared table for both categories, per spec §18 ("do not
-- create separate completely unrelated product systems").
-- ============================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('aurielle_collection', 'atelier_supply')),
  slug text not null unique,

  name text not null,
  description text,
  price numeric(10,2) not null,
  currency text not null,
  size text,
  status text not null default 'draft' check (status in ('active', 'draft')),

  -- Aurielle Collection only
  perfume_type text check (perfume_type in ('Perfume Oil', 'Waterbased')),
  -- Optional editorial grouping that powers the homepage's "Find Your
  -- Scent" mood chips (not a spec §5 required field, but dropping it
  -- would silently break an already-shipped homepage feature -- kept
  -- as an optional extra on top of the spec's required field list).
  mood text check (mood in ('Feminine', 'Mysterious', 'Elegant', 'Warm', 'Alluring')),

  -- Atelier Supply only
  product_type_id uuid references product_types(id),
  serial_number int,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint products_category_fields check (
    (category = 'aurielle_collection' and product_type_id is null)
    or
    (category = 'atelier_supply' and perfume_type is null and mood is null)
  )
);
create index if not exists products_category_idx on products (category);
create index if not exists products_status_idx on products (status);
create unique index if not exists products_serial_number_idx
  on products (serial_number) where serial_number is not null;

create table if not exists product_tags (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  tag text not null,
  unique (product_id, tag)
);
create index if not exists product_tags_product_id_idx on product_tags (product_id);

-- ============================================================
-- PRODUCT IMAGES: Cloudinary is the asset store (spec §7); this table
-- holds only the reference + metadata, never the binary.
-- ============================================================
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  cloudinary_public_id text not null,
  cloudinary_url text not null,
  is_primary boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_id_idx on product_images (product_id);

-- ============================================================
-- Row Level Security. Public (anon-equivalent) reads see only active
-- products; admin_users/admin_sessions have no public policy at all
-- (service role only). This is defense-in-depth: the app's read path
-- already uses the service-role client server-side only (never
-- exposed to the browser), same as the rest of this codebase.
-- ============================================================
alter table admin_users enable row level security;
alter table admin_sessions enable row level security;
alter table product_types enable row level security;
alter table products enable row level security;
alter table product_tags enable row level security;
alter table product_images enable row level security;

create policy "Public can read active products" on products
  for select using (status = 'active');

create policy "Public can read tags of active products" on product_tags
  for select using (
    exists (select 1 from products p where p.id = product_id and p.status = 'active')
  );

create policy "Public can read images of active products" on product_images
  for select using (
    exists (select 1 from products p where p.id = product_id and p.status = 'active')
  );

create policy "Public can read product types" on product_types
  for select using (true);
