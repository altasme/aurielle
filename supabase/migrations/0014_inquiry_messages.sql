-- Conversational email threads for Quotes and Inquiries.
--
-- Every reply the admin sends via "Reply via Aurielle Email", and every
-- inbound reply a customer sends back, is recorded as one row here so
-- the composer can render the full back-and-forth as a thread. Inbound
-- rows are written by the separate email-worker/ Cloudflare Worker
-- (Email Routing handler), not by this Next.js app -- it authenticates
-- with the same Supabase service role key and inserts directly.
--
-- `inquiry_id` intentionally has no foreign key: it points at one of
-- three different tables (contact_inquiries / wholesale_inquiries /
-- customisation_quotes) depending on `source`, so the pairing is
-- enforced in application code, the same pattern the three inquiry
-- libs already use independently of each other.
create table if not exists inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('contact', 'business', 'studio')),
  inquiry_id uuid not null,
  direction text not null check (direction in ('inbound', 'outbound')),
  from_email text not null,
  from_name text,
  to_email text not null,
  subject text,
  body_text text,
  body_html text,
  attachments jsonb not null default '[]'::jsonb,
  message_id text,
  created_at timestamptz not null default now()
);

create index if not exists inquiry_messages_thread_idx
  on inquiry_messages (source, inquiry_id, created_at);

-- Inbound mail that didn't match the per-inquiry reply address pattern
-- (hello+<source>-<id>@...) -- e.g. someone emailing hello@ directly
-- instead of replying to an admin message. Kept so nothing inbound is
-- silently dropped once hello@ routes through Cloudflare Email Routing
-- instead of the z.com webmail inbox.
create table if not exists unmatched_inbound_emails (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  from_email text not null,
  from_name text,
  subject text,
  body_text text,
  body_html text,
  attachments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table inquiry_messages enable row level security;
alter table unmatched_inbound_emails enable row level security;
-- No public policy on either: service role only (the admin app and the
-- email-worker both authenticate with the service role key), same as
-- every other write in this app.

-- Private Storage bucket for inbound/outbound email attachments,
-- mirroring payment-proofs (0004) and customisation-artwork (0012):
-- only the service-role client can read/write it, admin views a file
-- via a short-lived signed URL.
insert into storage.buckets (id, name, public)
values ('inquiry-attachments', 'inquiry-attachments', false)
on conflict (id) do nothing;
