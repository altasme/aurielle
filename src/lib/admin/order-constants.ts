// Split out from src/lib/admin/orders.ts (server-only, reads from
// Supabase) so client components like OrderStatusForm can still import
// these plain constants/labels.

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type OrderStatus = "pending_verification" | "received" | "processing" | "fulfilled" | "cancelled";

export const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];
export const ORDER_STATUSES: OrderStatus[] = [
  "pending_verification",
  "received",
  "processing",
  "fulfilled",
  "cancelled",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_verification: "Pending Verification",
  received: "Received",
  processing: "Processing",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};
