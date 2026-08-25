-- v5 addendum: Customisation Studio (UV printing) pillar. Quote-based,
-- no commerce -- rides the same "write a record, admin reviews it"
-- pattern already used for wholesale/contact inquiries and affiliate
-- applications, as its own dedicated table (this codebase never grew
-- a single generic `inquiries` table with an `inquiry_type` column to
-- key off, so a new table matches the existing convention better than
-- inventing one now).
create table if not exists customisation_quotes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  country text,
  grouping text,
  item_interest text,
  quantity text,
  message text,
  artwork_path text,
  created_at timestamptz not null default now()
);

alter table customisation_quotes enable row level security;
-- No public policy: service role only, same as every other write in
-- this app.

-- Private Storage bucket for uploaded artwork/logo files, mirroring
-- payment-proofs (0004): only the service-role client can read/write
-- it, admin views it via a short-lived signed URL.
insert into storage.buckets (id, name, public)
values ('customisation-artwork', 'customisation-artwork', false)
on conflict (id) do nothing;
