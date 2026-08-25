-- Admin panel restructure: "Customisation Quotes" becomes "Quotes and
-- Inquiries" with three submenus (Contact Page, Business, Customisation
-- Studio). contact_inquiries and wholesale_inquiries have existed since
-- 0001 but never had an admin view; this adds the same unviewed-item
-- tracking orders already has (0010's viewed_at pattern) to all three
-- inquiry/quote tables, for the new nav counter badges.

alter table contact_inquiries add column if not exists viewed_at timestamptz;
alter table wholesale_inquiries add column if not exists viewed_at timestamptz;
alter table customisation_quotes add column if not exists viewed_at timestamptz;
