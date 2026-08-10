-- Perfume names come from the client's own public marketing material
-- (spec §2) — unlike supply_materials, there's no alias/brand-leak
-- concern gating visibility. The storefront already shows all Aurielle
-- Collection names with a "pricing pending" state on the product page,
-- so `available` here should describe "orderable", not "visible".
-- Supply materials keep their stricter available=true gate (0001) since
-- that flag is what hides rows still carrying an unreviewed designer
-- name in search_aliases per the alias-only rule (§13a).

drop policy if exists "Public can read available perfumes" on perfumes;

create policy "Public can read perfumes" on perfumes
  for select using (true);
