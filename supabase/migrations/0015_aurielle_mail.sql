-- Aurielle Mail: a proper inbox for anything sent to hello@ that
-- doesn't match a Quotes and Inquiries reply address (see
-- email-worker/src/index.ts's "unmatched" fallback) -- e.g. someone
-- emailing hello@ directly. Read/unread, reply, and permanent delete,
-- all separate from the Quotes and Inquiries workflow.

-- unmatched_inbound_emails (0014) already holds exactly this data; it
-- just needs a proper name and a viewed_at column to match the
-- unread-badge pattern every other admin list already uses.
alter table unmatched_inbound_emails rename to general_mail;
alter table general_mail add column if not exists viewed_at timestamptz;

-- Replies to an Aurielle Mail message (and the customer's follow-up
-- replies to those) are recorded in inquiry_messages exactly like a
-- Quotes and Inquiries thread -- inquiry_id points at general_mail.id
-- when source = 'mail'. Postgres's default name for an inline column
-- check constraint is "<table>_<column>_check", which is what
-- 0014_inquiry_messages.sql's `source text ... check (...)` produced.
alter table inquiry_messages drop constraint if exists inquiry_messages_source_check;
alter table inquiry_messages add constraint inquiry_messages_source_check
  check (source in ('contact', 'business', 'studio', 'mail'));
