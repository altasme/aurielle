-- "Website Management" (admin): lets the client edit text and photos
-- across the public site herself, without a code change per edit.
--
-- Only OVERRIDES live here -- the current hardcoded copy stays in code
-- as each field's default (src/lib/site-content.ts), so a page never
-- needs a migration seeded with hand-escaped SQL string literals for
-- every headline on the site. A page reads `override ?? default`
-- (src/lib/site-content.ts's resolvePageContent()); the admin editor
-- shows the same resolved value, pre-filled, so the client always sees
-- the live text whether or not it's ever been edited.
create table if not exists site_text_fields (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  field_key text not null,
  value text not null,
  updated_at timestamptz not null default now(),
  unique (page, field_key)
);

-- image_url is whatever the public page should render -- either a
-- Cloudinary secure_url (once replaced via the admin uploader) or,
-- before that, never inserted at all (the code-side default, an
-- existing /images/... static asset path, is used instead).
-- cloudinary_public_id is only set once an actual upload has happened,
-- so a later replace/reset knows whether there's a Cloudinary asset to
-- delete.
create table if not exists site_image_slots (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  slot_key text not null,
  image_url text not null,
  cloudinary_public_id text,
  updated_at timestamptz not null default now(),
  unique (page, slot_key)
);

alter table site_text_fields enable row level security;
alter table site_image_slots enable row level security;
-- No public policies: every public page reads this server-side with
-- the service-role admin client (same pattern as the rest of this
-- app -- see 0003_phase1_writes_only.sql), never the anon key.
