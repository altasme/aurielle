import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/order-constants";

export type { OrderStatus, PaymentStatus } from "@/lib/admin/order-constants";

export type BusinessLine = "collection" | "atelier_supply";

export type Address = {
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  businessLine: BusinessLine;
  customerName: string;
  customerEmail: string;
  currency: string;
  total: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  viewedAt: string | null;
};

export type OrderItem = {
  id: string;
  nameSnapshot: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  pricingUnit: string | null;
  lineSubtotal: number;
  serialNumber: number | null;
};

export type OrderDetail = OrderListItem & {
  customerPhone: string | null;
  customerCountry: string;
  billingAddress: Address;
  shippingAddress: Address;
  shippingSameAsBilling: boolean;
  subtotal: number;
  shippingCost: number;
  proofPath: string | null;
  courierName: string | null;
  trackingNumber: string | null;
  items: OrderItem[];
};

const LIST_SELECT =
  "id, order_number, business_line, customer_name, customer_email, currency, total, payment_method, payment_status, order_status, created_at, viewed_at";

type ListRow = {
  id: string;
  order_number: string;
  business_line: BusinessLine;
  customer_name: string;
  customer_email: string;
  currency: string;
  total: number;
  payment_method: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  viewed_at: string | null;
};

function mapListRow(row: ListRow): OrderListItem {
  return {
    id: row.id,
    orderNumber: row.order_number,
    businessLine: row.business_line,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    currency: row.currency,
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
    viewedAt: row.viewed_at,
  };
}

// PostgREST's .or() takes a raw comma-separated filter string; strip the
// characters that have syntactic meaning there so a search term can't
// break (or maliciously craft) the filter.
function sanitizeForOr(value: string): string {
  return value.replace(/[,()]/g, "").trim();
}

export async function listOrders(params: {
  businessLine?: BusinessLine;
  orderStatus?: OrderStatus;
  search?: string;
}): Promise<OrderListItem[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("orders").select(LIST_SELECT).order("created_at", { ascending: false });

  if (params.businessLine) query = query.eq("business_line", params.businessLine);
  if (params.orderStatus) query = query.eq("order_status", params.orderStatus);

  const search = params.search ? sanitizeForOr(params.search) : "";
  if (search) {
    query = query.or(
      `order_number.ilike.%${search}%,customer_name.ilike.%${search}%,customer_email.ilike.%${search}%`,
    );
  }

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list orders: ${error.message}`);
  return (data ?? []).map(mapListRow);
}

export async function countUnviewedOrders(): Promise<number> {
  const supabase = getSupabaseAdminClient();
  const { count, error } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .is("viewed_at", null);

  if (error) throw new Error(`Failed to count unviewed orders: ${error.message}`);
  return count ?? 0;
}

// Called only from the order detail page itself (not from getOrder(),
// which is also reused internally by the PATCH route) so opening an
// order for editing doesn't get conflated with an admin actually having
// seen it -- though in practice those happen together.
export async function markOrderViewed(id: string): Promise<void> {
  const supabase = getSupabaseAdminClient();
  await supabase.from("orders").update({ viewed_at: new Date().toISOString() }).eq("id", id).is("viewed_at", null);
}

export async function getOrder(id: string): Promise<OrderDetail | null> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `${LIST_SELECT}, customer_phone, customer_country, billing_address, shipping_address, shipping_same_as_billing, subtotal, shipping_cost, proof_url, courier_name, tracking_number`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load order: ${error.message}`);
  if (!data) return null;

  const { data: itemRows, error: itemsError } = await supabase
    .from("order_items")
    .select("id, name_snapshot, quantity, unit_price, currency, pricing_unit, line_subtotal, serial_number")
    .eq("order_id", id);
  if (itemsError) throw new Error(`Failed to load order items: ${itemsError.message}`);

  return {
    ...mapListRow(data),
    customerPhone: data.customer_phone,
    customerCountry: data.customer_country,
    billingAddress: data.billing_address as Address,
    shippingAddress: data.shipping_address as Address,
    shippingSameAsBilling: data.shipping_same_as_billing,
    subtotal: Number(data.subtotal),
    shippingCost: Number(data.shipping_cost),
    proofPath: data.proof_url,
    courierName: data.courier_name,
    trackingNumber: data.tracking_number,
    items: (itemRows ?? []).map((row) => ({
      id: row.id,
      nameSnapshot: row.name_snapshot,
      quantity: Number(row.quantity),
      unitPrice: Number(row.unit_price),
      currency: row.currency,
      pricingUnit: row.pricing_unit,
      lineSubtotal: Number(row.line_subtotal),
      serialNumber: row.serial_number,
    })),
  };
}

export async function updateOrderStatus(
  id: string,
  input: {
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    courierName?: string;
    trackingNumber?: string;
  },
): Promise<void> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from("orders")
    .update({
      order_status: input.orderStatus,
      payment_status: input.paymentStatus,
      courier_name: input.courierName ?? null,
      tracking_number: input.trackingNumber ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(`Failed to update order: ${error.message}`);
}

// The proof-of-payment bucket is private (no public policy, spec v4
// §20); a signed URL is minted on demand for an authenticated admin to
// view it, rather than exposing the bucket publicly.
export async function getProofSignedUrl(path: string): Promise<string> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 300);
  if (error || !data) throw new Error(`Failed to sign proof URL: ${error?.message}`);
  return data.signedUrl;
}
