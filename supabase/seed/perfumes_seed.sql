-- Placeholder seed for the AURIELLE COLLECTION (B2C perfumes).
-- Names are taken verbatim from the client's own marketing material
-- (spec section 2). Price, size, description and images are NOT
-- invented -- they are left null/placeholder pending client input,
-- per the spec's "final commercial data must come from the client" rule.

insert into perfumes (name, slug, description, scent_profile, available, featured) values
  ('Belle Eternelle', 'belle-eternelle', null, '{}', false, false),
  ('Fleur de Lumière', 'fleur-de-lumiere', null, '{}', false, false),
  ('Ambre Sauvage', 'ambre-sauvage', null, '{}', false, false),
  ('Bois Sacré', 'bois-sacre', null, '{}', false, false),
  ('Visionnaire', 'visionnaire', null, '{}', false, false),
  ('Mystère XIII', 'mystere-xiii', null, '{}', false, false),
  ('Rose de Minuit', 'rose-de-minuit', null, '{}', false, false),
  ('Cerise Noir', 'cerise-noir', null, '{}', false, false),
  ('Noir Élixir', 'noir-elixir', null, '{}', false, false),
  ('Donna Velours', 'donna-velours', null, '{}', false, false),
  ('Rosalie Élégance', 'rosalie-elegance', null, '{}', false, false),
  ('Paris Nocturne', 'paris-nocturne', null, '{}', false, false),
  ('Rouge Royale', 'rouge-royale', null, '{}', false, false),
  ('Satin Mystique', 'satin-mystique', null, '{}', false, false)
on conflict (slug) do nothing;

-- All rows are `available = false` until the client confirms pricing,
-- size and description -- flip to true per-product in the admin CMS.
