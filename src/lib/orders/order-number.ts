import "server-only";

// AUR-YYYYMMDD-XXXXXX (6 random base36 chars). Collision risk is low
// enough that the insert-retry loop in the orders route (a handful of
// attempts) is sufficient rather than needing a DB sequence.
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  return `AUR-${date}-${random}`;
}
