// Split out from src/lib/admin/orders.ts (server-only, reads from
// Supabase) so client components like OrderStatusForm can still import
// these plain constants/labels.

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "pending_verification" | "to_pack" | "to_ship" | "shipped_out" | "cancelled";

export const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

// Fulfillment pipeline (client feedback round 3): "cancelled" sits
// outside the happy path for orders that don't ship.
export const ORDER_STATUSES: OrderStatus[] = ["pending_verification", "to_pack", "to_ship", "shipped_out", "cancelled"];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_verification: "Pending Verification",
  to_pack: "To Pack",
  to_ship: "To Ship",
  shipped_out: "Shipped Out",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};
