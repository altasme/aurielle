-- "Move to Junk" (soft delete) for Quotes and Inquiries + Aurielle
-- Mail: junked_at marks a row as dismissed without losing it outright.
-- list*() functions exclude junked rows by default; a Junk view lists
-- them with Restore / Delete Permanently actions.
alter table contact_inquiries add column if not exists junked_at timestamptz;
alter table wholesale_inquiries add column if not exists junked_at timestamptz;
alter table customisation_quotes add column if not exists junked_at timestamptz;
alter table general_mail add column if not exists junked_at timestamptz;

create index if not exists contact_inquiries_junked_at_idx on contact_inquiries (junked_at);
create index if not exists wholesale_inquiries_junked_at_idx on wholesale_inquiries (junked_at);
create index if not exists customisation_quotes_junked_at_idx on customisation_quotes (junked_at);
create index if not exists general_mail_junked_at_idx on general_mail (junked_at);
