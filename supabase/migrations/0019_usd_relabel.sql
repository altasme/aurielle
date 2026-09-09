-- Sitewide pricing is now labeled in USD ($) rather than PHP (peso, ₱)
-- for Aurielle Collection -- a relabel only, no price numbers change.
-- Aurielle Collection products/orders were stored with the literal "₱"
-- character as their currency value (Atelier Supply already used the
-- "USD" code); this brings existing rows in line with what all new
-- code now writes, so nothing sitewide is left showing the old
-- currency value. src/lib/format-money.ts already displays "₱" as "$"
-- too, so this migration is about data consistency, not a display fix
-- in itself.
update products set currency = 'USD' where currency = '₱';
update orders set currency = 'USD' where currency = '₱';
update order_items set currency = 'USD' where currency = '₱';
