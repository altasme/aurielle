-- AURIELLE PARIS ATELIER: initial schema
-- See docs/spec/AURIELLE_SPEC_v3.md for the product requirements this implements.

create extension if not exists "pgcrypto";

-- ============================================================
-- AURIELLE COLLECTION (B2C perfumes)
-- ============================================================
create table if not exists perfumes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  scent_profile text[] not null default '{}',
  size text,
  type text not null default 'Perfume Oil',
  alcohol_free boolean not null default true,
  made_in text default 'France',
  price numeric(10,2),
  currency text not null default 'PHP' check (currency in ('PHP', 'EUR')),
  images jsonb not null default '[]',
  featured boolean not null default false,
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ATELIER SUPPLY (B2B fragrance materials, smell-alike oils)
-- Alias-only rule (spec §13a): `search_aliases` is indexed for search
-- matching only. Application code must never select/render this column
-- on any public-facing surface (cards, PDP, cart, meta tags, slugs).
-- ============================================================
create table if not exists supply_materials (
  id uuid primary key default gen_random_uuid(),
  serial_number int unique,
  display_name text not null,
  slug text not null unique,
  description text,
  category text,
  price numeric(10,2) not null,
  currency text not null default 'USD',
  pricing_unit text not null default 'KG' check (pricing_unit in ('KG', 'LITER', 'UNIT')),
  moq numeric(10,2),
  search_aliases text not null default '',
  needs_review boolean not null default false,
  images jsonb not null default '[]',
  available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists supply_materials_search_idx
  on supply_materials using gin (
    to_tsvector('simple', coalesce(display_name, '') || ' ' || coalesce(search_aliases, ''))
  );

-- ============================================================
-- ORDERS: two independent flows (B2C / B2B), never mixed in one order.
-- Merchant of record is the client; `source` marks every website order
-- for offline commission reconciliation (spec §20).
-- ============================================================
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  source text not null default 'website',
  business_line text not null check (business_line in ('collection', 'atelier_supply')),

  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  customer_country text not null,

  billing_address jsonb not null,
  shipping_address jsonb not null,
  shipping_same_as_billing boolean not null default true,

  currency text not null,
  subtotal numeric(10,2) not null,
  shipping_cost numeric(10,2) not null default 0,
  total numeric(10,2) not null,

  payment_method text not null check (payment_method in ('stripe', 'gcash', 'bank_transfer')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  order_status text not null default 'received' check (order_status in ('received', 'processing', 'fulfilled', 'cancelled')),
  proof_of_payment_url text,
  stripe_payment_intent_id text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_created_at_idx on orders (created_at);
create index if not exists orders_business_line_idx on orders (business_line);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  perfume_id uuid references perfumes(id),
  supply_material_id uuid references supply_materials(id),
  name_snapshot text not null,
  quantity numeric(10,2) not null,
  unit_price numeric(10,2) not null,
  line_subtotal numeric(10,2) not null,
  constraint order_items_one_product check (
    (perfume_id is not null and supply_material_id is null) or
    (perfume_id is null and supply_material_id is not null)
  )
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- ============================================================
-- WHOLESALE / CONTACT inquiries (§25/§26)
-- ============================================================
create table if not exists wholesale_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  email text not null,
  country text not null,
  product_interest text,
  estimated_quantity text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  country text,
  inquiry_type text,
  message text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- Public (anon) role: read-only on published catalogue rows.
-- All writes (admin CMS, order creation) go through server-side code
-- using the service role key, never the anon key.
-- ============================================================
alter table perfumes enable row level security;
alter table supply_materials enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table wholesale_inquiries enable row level security;
alter table contact_inquiries enable row level security;

create policy "Public can read available perfumes" on perfumes
  for select using (available = true);

create policy "Public can read available supply materials" on supply_materials
  for select using (available = true);

-- No public policies on orders / order_items / inquiries: service role only.
