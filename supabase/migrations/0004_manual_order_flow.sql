-- Manual (Kolekta-pattern) order flow support (spec v4 §15/§17).

-- Private Storage bucket for proof-of-payment uploads. Only the
-- service-role client (used server-side in the order write route) can
-- read/write it — no public policy is added, so it stays inaccessible
-- via the anon key.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

-- Orders start life awaiting manual payment verification (no Stripe in
-- Phase 1 — GCash / bank transfer + proof upload, verified by the team).
alter table orders drop constraint if exists orders_order_status_check;
alter table orders
  add constraint orders_order_status_check
  check (order_status in ('pending_verification', 'received', 'processing', 'fulfilled', 'cancelled'));

alter table orders alter column order_status set default 'pending_verification';
