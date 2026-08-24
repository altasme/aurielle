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
-- ============================================================
alter table orders drop constraint if exists orders_order_status_check;
alter table orders
  add constraint orders_order_status_check
  check (order_status in ('pending_verification', 'to_pack', 'to_ship', 'shipped_out', 'cancelled'));

-- Existing rows using the old received/processing/fulfilled values
-- move to the closest equivalent in the new pipeline.
update orders set order_status = 'to_pack' where order_status = 'received';
update orders set order_status = 'to_ship' where order_status = 'processing';
update orders set order_status = 'shipped_out' where order_status = 'fulfilled';

-- Shipment details, set when an order moves to "Shipped Out".
alter table orders add column if not exists courier_name text;
alter table orders add column if not exists tracking_number text;
