-- Client feedback round 3: affiliate program, unviewed-order tracking,
-- a fulfillment-oriented order status pipeline, and shipment tracking.

-- ============================================================
-- AFFILIATE PROGRAM: public "Be an Affiliate" nav button submits an
-- application here; admin views them under the new Affiliate
-- Management dashboard module. Service-role only, same pattern as
-- wholesale_inquiries/contact_inquiries -- no public read policy.
-- ============================================================
create table if not exists affiliate_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  mobile_number text not null,
  email text not null,
  shopee_id text,
  fb_page text,
  tiktok_account text,
  created_at timestamptz not null default now()
);

alter table affiliate_applications enable row level security;
-- No public policy: service role only (the write route uses the
-- service-role client, same as every other write in this app).

-- ============================================================
-- ORDERS: unviewed-order tracking for the admin dashboard's counter
-- badge -- null until an admin opens the order's detail page.
-- ============================================================
alter table orders add column if not exists viewed_at timestamptz;

-- ============================================================
-- ORDERS: fulfillment-oriented status pipeline, replacing the
-- generic received/processing/fulfilled steps. "cancelled" is kept
-- outside the happy path for orders that don't ship.
--
-- The old (0004) constraint only allows pending_verification/
-- received/processing/fulfilled/cancelled -- it must be dropped
-- BEFORE the UPDATEs below, or the UPDATEs themselves get rejected
-- for writing a new status name (e.g. 'to_pack') the old constraint
-- has never heard of. The new, strict constraint is only added back
-- at the very end, once every row already holds a valid new value.
-- ============================================================
alter table orders drop constraint if exists orders_order_status_check;

update orders set order_status = 'to_pack' where order_status = 'received';
update orders set order_status = 'to_ship' where order_status = 'processing';
update orders set order_status = 'shipped_out' where order_status = 'fulfilled';

-- Catch-all: any row holding some other stray/legacy value (blank,
-- NULL, or anything not named above) falls back to the pipeline's
-- starting status rather than blocking the constraint below.
update orders set order_status = 'pending_verification'
  where order_status is null
     or order_status not in ('pending_verification', 'to_pack', 'to_ship', 'shipped_out', 'cancelled');

alter table orders
  add constraint orders_order_status_check
  check (order_status in ('pending_verification', 'to_pack', 'to_ship', 'shipped_out', 'cancelled'));

-- Shipment details, set when an order moves to "Shipped Out".
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_number text;
