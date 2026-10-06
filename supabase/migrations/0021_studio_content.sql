-- Moves the Customisation Studio's groupings/items and finish tiles
-- from hardcoded data files (src/lib/data/studio-groupings.ts,
-- studio-finishes.ts) into the database, so Website Management can
-- edit them without a code change + redeploy. Same admin-authored,
-- service-role-only pattern as products/promotions -- not the
-- site_text_fields "code default + override" pattern, since this is
-- structured, repeating data (a variable-length item list per
-- grouping), not a flat scalar.
--
-- image_url columns hold whatever the public page should render --
-- either the existing static /images/studio/... path (seeded below,
-- unchanged from today) or an R2 URL once replaced through the admin
-- uploader -- same storage-agnostic convention as
-- site_image_slots.image_url.
create table if not exists studio_groupings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  intro text not null,
  spotlight boolean not null default false,
  -- Nullable so a newly-created grouping can be saved before its
  -- photo is uploaded -- StudioImageSlot already renders a labeled
  -- placeholder block for an empty image (launch-integrity rule: no
  -- fabricated stock photo), same as any grouping did before its real
  -- photo existed.
  image_url text,
  image_brief text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists studio_grouping_items (
  id uuid primary key default gen_random_uuid(),
  grouping_id uuid not null references studio_groupings(id) on delete cascade,
  label text not null,
  -- Null falls back to the parent grouping's image_url (see
  -- StudioGroupingGallery) -- not every item needs its own photo.
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists studio_grouping_items_grouping_id_idx on studio_grouping_items (grouping_id);

create table if not exists studio_finishes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table studio_groupings enable row level security;
alter table studio_grouping_items enable row level security;
alter table studio_finishes enable row level security;
-- No public policies: the public pages read these server-side with
-- the service-role admin client, same as every other admin-authored
-- table in this app.

-- Seed with today's content so nothing changes visually on deploy.
insert into studio_groupings (slug, name, intro, spotlight, image_url, image_brief, sort_order) values
  (
    'luxury-packaging-branding',
    'Luxury Packaging & Branding',
    'Perfume and beauty packaging, metal and mini labels, brand plates, acrylic awards and crystal UV stickers -- finished with the same craftsmanship as the Aurielle Collection itself.',
    true,
    '/images/studio/luxury-packaging-branding/perfume-bottle-printing.jpg',
    'Perfume packaging, metal labels',
    0
  ),
  (
    'personal-gifts',
    'Personal Gifts',
    'Custom printing for the people and moments in your life -- phone cases, home decor, wedding keepsakes, souvenirs and fashion accessories.',
    false,
    '/images/studio/personal-gifts/phone-cases.jpg',
    'Phone case or keepsake',
    1
  ),
  (
    'business-solutions',
    'Business Solutions',
    'Branded materials for restaurants, offices and storefronts -- corporate gifts, hospitality items, access cards, signage and name plates.',
    false,
    '/images/studio/business-solutions/corporate-gifts.jpg',
    'Signage, cards, name plates',
    2
  ),
  (
    'industrial-printing',
    'Industrial Printing',
    'Small-batch and prototype production for manufacturers and private-label brands -- metal printing, small plastics, labels and tags.',
    false,
    '/images/studio/industrial-printing/metal-printing.jpg',
    'The A3 UV DTF printer',
    3
  )
on conflict (slug) do nothing;

-- Luxury Packaging & Branding's items were just replaced with a new
-- set of 6 print techniques (none have a dedicated photo yet -- all
-- fall back to the grouping's image_url above).
insert into studio_grouping_items (grouping_id, label, image_url, sort_order)
select id, item.label, null, item.ord
from studio_groupings, lateral (
  values
    ('Direct Perfume Bottle Printing', 0),
    ('3D Printed Metal Labels', 1),
    ('UV DTF Transfer Sticker', 2),
    ('Laser Engraving', 3),
    ('UV Crystal Labels', 4),
    ('Wood Cap Colored Laser Printing', 5)
) as item(label, ord)
where studio_groupings.slug = 'luxury-packaging-branding'
on conflict do nothing;

insert into studio_grouping_items (grouping_id, label, image_url, sort_order)
select id, item.label, item.image_url, item.ord
from studio_groupings, lateral (
  values
    ('Phone & Electronics Cases', '/images/studio/personal-gifts/phone-cases.jpg', 0),
    ('Home Decoration', '/images/studio/personal-gifts/home-decoration.jpg', 1),
    ('Wedding & Event Keepsakes', '/images/studio/personal-gifts/wedding-event-keepsakes.jpg', 2),
    ('Souvenirs', '/images/studio/personal-gifts/souvenirs.jpg', 3),
    ('Fashion Accessories', '/images/studio/personal-gifts/fashion-accessories.jpg', 4)
) as item(label, image_url, ord)
where studio_groupings.slug = 'personal-gifts'
on conflict do nothing;

insert into studio_grouping_items (grouping_id, label, image_url, sort_order)
select id, item.label, item.image_url, item.ord
from studio_groupings, lateral (
  values
    ('Corporate Gifts', '/images/studio/business-solutions/corporate-gifts.jpg', 0),
    ('Restaurant & Hospitality Items', '/images/studio/business-solutions/restaurant-hospitality-items.jpg', 1),
    ('PVC / Loyalty / Access Cards', '/images/studio/business-solutions/pvc-loyalty-access-cards.jpg', 2),
    ('Acrylic Signage', '/images/studio/business-solutions/acrylic-signage.jpg', 3),
    ('QR Displays', '/images/studio/business-solutions/qr-displays.jpg', 4),
    ('Name Plates', '/images/studio/business-solutions/name-plates.jpg', 5)
) as item(label, image_url, ord)
where studio_groupings.slug = 'business-solutions'
on conflict do nothing;

insert into studio_grouping_items (grouping_id, label, image_url, sort_order)
select id, item.label, item.image_url, item.ord
from studio_groupings, lateral (
  values
    ('Metal Printing', '/images/studio/industrial-printing/metal-printing.jpg', 0),
    ('Small Plastics', '/images/studio/industrial-printing/small-plastics.jpg', 1),
    ('Custom Manufacturing (Prototype / Small-Batch / Private-Label)', '/images/studio/industrial-printing/custom-manufacturing.jpg', 2),
    ('Labels & Tags', '/images/studio/industrial-printing/labels-tags.jpg', 3)
) as item(label, image_url, ord)
where studio_groupings.slug = 'industrial-printing'
on conflict do nothing;

insert into studio_finishes (name, description, image_url, sort_order) values
  ('Direct 3D Embossed Bottle Print', 'Raised, tactile 3D printing straight onto the bottle surface.', '/images/studio/finishes/direct-3d-embossed-bottle-print.jpg', 0),
  ('Direct Mirror Bottle Print', 'Vivid full-colour printing onto a mirrored bottle finish.', '/images/studio/finishes/direct-mirror-bottle-print.jpg', 1),
  ('UV DTF Crystal Label', 'Crystal-clear UV DTF labels with dimensional sparkle.', '/images/studio/finishes/uv-dtf-crystal-label.jpg', 2),
  ('Colored Metal Label', 'Full-colour printing on durable metal labels.', '/images/studio/finishes/colored-metal-label.jpg', 3),
  ('Direct Bottle Print', 'Full-colour printing applied directly onto the bottle.', '/images/studio/finishes/direct-bottle-print.jpg', 4),
  ('3D Printed Metal Labels', 'Raised, dimensional 3D printing on metal labels.', '/images/studio/finishes/3d-printed-metal-labels.jpg', 5)
on conflict do nothing;
