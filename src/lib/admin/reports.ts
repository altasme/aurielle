import "server-only";
import { getSupabaseAdminClient } from "@/lib/supabase/server";
import type { BusinessLine } from "@/lib/admin/orders";
import { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/admin/order-constants";
import type { OrderStatus, PaymentStatus } from "@/lib/admin/order-constants";
import type { ReportRangeBounds } from "@/lib/admin/report-ranges";

const DAY_MS = 24 * 60 * 60 * 1000;

export type CurrencyAmount = { currency: string; amount: number };
export type RevenuePoint = { date: string; label: string; amount: number };
export type TopProduct = { slug: string; name: string; unitsSold: number; revenue: number };
export type PromotionPerformance = { id: string; name: string; ordersUsed: number; discountGiven: number; netRevenue: number };
export type DiscountCodePerformance = {
  id: string;
  code: string;
  name: string;
  ordersUsed: number;
  discountGiven: number;
  netRevenue: number;
};
export type CountryBreakdown = { country: string; orders: number; revenue: number };
export type StatusCount = { status: string; label: string; count: number };

export type BusinessLineReport = {
  businessLine: BusinessLine;
  // The currency most of this range's orders were placed in -- every
  // figure below is scoped to it (see dominantCurrency()). A boutique
  // business line is expected to trade in one currency; `otherCurrencies`
  // surfaces anything outside it instead of silently mixing totals.
  currency: string;
  otherCurrencies: CurrencyAmount[];
  excludedOtherCurrencyOrders: number;

  confirmedRevenue: number;
  previousConfirmedRevenue: number | null;
  grossSales: number;
  discountsGiven: number;
  ordersPlaced: number;
  paidOrders: number;
  averageOrderValue: number;
  pendingValue: number;
  pendingCount: number;
  cancelledValue: number;
  cancelledCount: number;

  revenueTrend: RevenuePoint[];
  orderStatusCounts: StatusCount[];
  paymentStatusCounts: StatusCount[];
  topProducts: TopProduct[];
  promotionPerformance: PromotionPerformance[];
  discountCodePerformance: DiscountCodePerformance[];
  geography: CountryBreakdown[];
};

type OrderItemRow = {
  catalogue_slug: string;
  name_snapshot: string;
  quantity: number;
  line_subtotal: number;
  promotion_discount_amount: number;
  promotion_id: string | null;
  currency: string;
  promotions: { name: string } | null;
};

type OrderRow = {
  id: string;
  customer_email: string;
  customer_country: string;
  currency: string;
  subtotal: number;
  total: number;
  promotion_discount_total: number;
  discount_code_amount: number;
  discount_code_id: string | null;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  created_at: string;
  discount_codes: { code: string; name: string } | null;
  order_items: OrderItemRow[];
};

// A single query per business line/range, not one-per-report-section:
// order_items embeds as a child collection (order_items.order_id ->
// orders.id) and, within it, promotions embeds a level deeper
// (order_items.promotion_id -> promotions.id) -- both individually
// already proven elsewhere (getOrder() in orders.ts embeds
// discount_codes the same way, and order_items -> promotions.name the
// same way, just via two separate queries there instead of one nested
// one). PostgREST supports arbitrary embed depth over singular FKs, so
// combining them here is expected to work the same way.
const ORDER_REPORT_SELECT =
  "id, customer_email, customer_country, currency, subtotal, total, promotion_discount_total, discount_code_amount, discount_code_id, payment_status, order_status, created_at, discount_codes(code, name), order_items(catalogue_slug, name_snapshot, quantity, line_subtotal, promotion_discount_amount, promotion_id, currency, promotions(name))";

function sum<T>(rows: T[], pick: (row: T) => number): number {
  return rows.reduce((total, row) => total + pick(row), 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// The currency most orders in a set were placed in. A business line is
// expected to trade in one currency at a time; this picks the majority
// so KPIs never silently add PHP to USD.
function dominantCurrency(rows: { currency: string }[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) counts.set(row.currency, (counts.get(row.currency) ?? 0) + 1);
  let best = "PHP";
  let bestCount = -1;
  for (const [currency, count] of counts) {
    if (count > bestCount) {
      best = currency;
      bestCount = count;
    }
  }
  return best;
}

function bucketUnit(from: Date | null, to: Date): "day" | "week" {
  if (!from) return "week";
  return (to.getTime() - from.getTime()) / DAY_MS > 60 ? "week" : "day";
}

// Monday-anchored week buckets, e.g. "Mar 3" for the week starting
// Monday March 3rd. Day buckets are just the calendar date.
function bucketKey(iso: string, unit: "day" | "week"): { key: string; label: string } {
  const date = new Date(iso);
  if (unit === "day") {
    return { key: date.toISOString().slice(0, 10), label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
  }
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dow = monday.getUTCDay();
  monday.setUTCDate(monday.getUTCDate() + (dow === 0 ? -6 : 1 - dow));
  return { key: monday.toISOString().slice(0, 10), label: monday.toLocaleDateString("en-US", { month: "short", day: "numeric" }) };
}

// Every bucket between fromTime and toTime, defaulting to zero -- a
// quiet week should show as a visible gap in the trend, not disappear
// from the chart entirely.
function buildBucketSeries(
  fromTime: number,
  toTime: number,
  unit: "day" | "week",
  amounts: Map<string, number>,
): RevenuePoint[] {
  const order: string[] = [];
  const labels = new Map<string, string>();
  for (let t = fromTime; t < toTime; t += DAY_MS) {
    const { key, label } = bucketKey(new Date(t).toISOString(), unit);
    if (!labels.has(key)) {
      labels.set(key, label);
      order.push(key);
    }
  }
  const last = bucketKey(new Date(toTime - 1).toISOString(), unit);
  if (!labels.has(last.key)) {
    labels.set(last.key, last.label);
    order.push(last.key);
  }
  return order.map((key) => ({ date: key, label: labels.get(key)!, amount: round2(amounts.get(key) ?? 0) }));
}

async function fetchOrderRows(businessLine: BusinessLine, from: Date | null, to: Date): Promise<OrderRow[]> {
  const supabase = getSupabaseAdminClient();
  let query = supabase
    .from("orders")
    .select(ORDER_REPORT_SELECT)
    .eq("business_line", businessLine)
    .lt("created_at", to.toISOString())
    .order("created_at", { ascending: true });
  if (from) query = query.gte("created_at", from.toISOString());

  const { data, error } = await query;
  if (error) throw new Error(`Failed to load orders for report: ${error.message}`);
  return (data ?? []) as unknown as OrderRow[];
}

export async function getBusinessLineReport(businessLine: BusinessLine, range: ReportRangeBounds): Promise<BusinessLineReport> {
  const earliestFrom = range.previousFrom ?? range.from;
  const rows = await fetchOrderRows(businessLine, earliestFrom, range.to);

  const currentFromTime = range.from
    ? range.from.getTime()
    : rows.length > 0
      ? new Date(rows[0].created_at).getTime()
      : range.to.getTime();

  const currentRows = rows.filter((r) => new Date(r.created_at).getTime() >= currentFromTime);
  const previousRows =
    range.previousFrom && range.previousTo
      ? rows.filter((r) => {
          const t = new Date(r.created_at).getTime();
          return t >= range.previousFrom!.getTime() && t < range.previousTo!.getTime();
        })
      : [];

  const currency = dominantCurrency(currentRows.length > 0 ? currentRows : rows);
  const scoped = currentRows.filter((r) => r.currency === currency);
  const excludedOtherCurrencyOrders = currentRows.length - scoped.length;

  const otherCurrenciesMap = new Map<string, number>();
  for (const r of currentRows) {
    if (r.currency === currency || r.order_status === "cancelled" || r.payment_status !== "paid") continue;
    otherCurrenciesMap.set(r.currency, (otherCurrenciesMap.get(r.currency) ?? 0) + Number(r.total));
  }
  const otherCurrencies: CurrencyAmount[] = [...otherCurrenciesMap.entries()].map(([c, amount]) => ({
    currency: c,
    amount: round2(amount),
  }));

  const nonCancelled = scoped.filter((r) => r.order_status !== "cancelled");
  const paid = nonCancelled.filter((r) => r.payment_status === "paid");
  const pending = nonCancelled.filter((r) => r.payment_status === "pending");
  const cancelled = scoped.filter((r) => r.order_status === "cancelled");

  const confirmedRevenue = round2(sum(paid, (r) => Number(r.total)));
  const grossSales = round2(sum(paid, (r) => Number(r.subtotal)));
  const discountsGiven = round2(sum(paid, (r) => Number(r.promotion_discount_total) + Number(r.discount_code_amount)));
  const pendingValue = round2(sum(pending, (r) => Number(r.total)));
  const cancelledValue = round2(sum(cancelled, (r) => Number(r.total)));
  const averageOrderValue = paid.length > 0 ? round2(confirmedRevenue / paid.length) : 0;

  const previousScoped = previousRows.filter(
    (r) => r.currency === currency && r.order_status !== "cancelled" && r.payment_status === "paid",
  );
  const previousConfirmedRevenue = range.previousFrom ? round2(sum(previousScoped, (r) => Number(r.total))) : null;

  const orderStatusCounts: StatusCount[] = ORDER_STATUSES.map((status) => ({
    status,
    label: ORDER_STATUS_LABELS[status],
    count: scoped.filter((r) => r.order_status === status).length,
  }));
  const paymentStatusCounts: StatusCount[] = PAYMENT_STATUSES.map((status) => ({
    status,
    label: PAYMENT_STATUS_LABELS[status],
    count: scoped.filter((r) => r.payment_status === status).length,
  }));

  const unit = bucketUnit(range.from, range.to);
  const revenueByBucket = new Map<string, number>();
  for (const r of paid) {
    const { key } = bucketKey(r.created_at, unit);
    revenueByBucket.set(key, (revenueByBucket.get(key) ?? 0) + Number(r.total));
  }
  const revenueTrend = buildBucketSeries(currentFromTime, range.to.getTime(), unit, revenueByBucket);

  const productMap = new Map<string, { name: string; units: number; revenue: number }>();
  for (const order of paid) {
    for (const item of order.order_items) {
      const entry = productMap.get(item.catalogue_slug) ?? { name: item.name_snapshot, units: 0, revenue: 0 };
      entry.units += Number(item.quantity);
      entry.revenue += Number(item.line_subtotal) - Number(item.promotion_discount_amount);
      productMap.set(item.catalogue_slug, entry);
    }
  }
  const topProducts: TopProduct[] = [...productMap.entries()]
    .map(([slug, v]) => ({ slug, name: v.name, unitsSold: round2(v.units), revenue: round2(v.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const promoMap = new Map<string, { name: string; discount: number; net: number; orderIds: Set<string> }>();
  for (const order of paid) {
    for (const item of order.order_items) {
      if (!item.promotion_id) continue;
      const entry = promoMap.get(item.promotion_id) ?? {
        name: item.promotions?.name ?? "(deleted promotion)",
        discount: 0,
        net: 0,
        orderIds: new Set<string>(),
      };
      entry.discount += Number(item.promotion_discount_amount);
      entry.net += Number(item.line_subtotal) - Number(item.promotion_discount_amount);
      entry.orderIds.add(order.id);
      promoMap.set(item.promotion_id, entry);
    }
  }
  const promotionPerformance: PromotionPerformance[] = [...promoMap.entries()]
    .map(([id, v]) => ({ id, name: v.name, ordersUsed: v.orderIds.size, discountGiven: round2(v.discount), netRevenue: round2(v.net) }))
    .sort((a, b) => b.discountGiven - a.discountGiven);

  const codeMap = new Map<string, { code: string; name: string; discount: number; net: number; orders: number }>();
  for (const order of paid) {
    if (!order.discount_code_id || !order.discount_codes) continue;
    const entry = codeMap.get(order.discount_code_id) ?? {
      code: order.discount_codes.code,
      name: order.discount_codes.name,
      discount: 0,
      net: 0,
      orders: 0,
    };
    entry.discount += Number(order.discount_code_amount);
    entry.net += Number(order.total);
    entry.orders += 1;
    codeMap.set(order.discount_code_id, entry);
  }
  const discountCodePerformance: DiscountCodePerformance[] = [...codeMap.entries()]
    .map(([id, v]) => ({ id, code: v.code, name: v.name, ordersUsed: v.orders, discountGiven: round2(v.discount), netRevenue: round2(v.net) }))
    .sort((a, b) => b.discountGiven - a.discountGiven);

  const countryMap = new Map<string, { orders: number; revenue: number }>();
  for (const order of paid) {
    const entry = countryMap.get(order.customer_country) ?? { orders: 0, revenue: 0 };
    entry.orders += 1;
    entry.revenue += Number(order.total);
    countryMap.set(order.customer_country, entry);
  }
  const geography: CountryBreakdown[] = [...countryMap.entries()]
    .map(([country, v]) => ({ country, orders: v.orders, revenue: round2(v.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    businessLine,
    currency,
    otherCurrencies,
    excludedOtherCurrencyOrders,
    confirmedRevenue,
    previousConfirmedRevenue,
    grossSales,
    discountsGiven,
    ordersPlaced: nonCancelled.length,
    paidOrders: paid.length,
    averageOrderValue,
    pendingValue,
    pendingCount: pending.length,
    cancelledValue,
    cancelledCount: cancelled.length,
    revenueTrend,
    orderStatusCounts,
    paymentStatusCounts,
    topProducts,
    promotionPerformance,
    discountCodePerformance,
    geography,
  };
}

export type CustomerInsights = {
  currency: string;
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  topCustomers: { email: string; name: string; orders: number; totalSpent: number }[];
};

type CustomerOrderRow = { customer_email: string; customer_name: string; currency: string; total: number };

// Lifetime (not date-range-scoped) repeat-purchase behavior -- a 30-day
// window rarely has enough volume for a boutique brand to show repeat
// customers at all, so this reads the full order history regardless of
// the page's selected range.
export async function getCustomerInsights(businessLine: BusinessLine): Promise<CustomerInsights> {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("customer_email, customer_name, currency, total")
    .eq("business_line", businessLine)
    .eq("payment_status", "paid")
    .neq("order_status", "cancelled");
  if (error) throw new Error(`Failed to load customer insights: ${error.message}`);

  const rows = (data ?? []) as CustomerOrderRow[];
  const currency = dominantCurrency(rows);
  const scoped = rows.filter((r) => r.currency === currency);

  const byCustomer = new Map<string, { name: string; orders: number; total: number }>();
  for (const r of scoped) {
    const entry = byCustomer.get(r.customer_email) ?? { name: r.customer_name, orders: 0, total: 0 };
    entry.orders += 1;
    entry.total += Number(r.total);
    byCustomer.set(r.customer_email, entry);
  }

  const totalCustomers = byCustomer.size;
  const repeatCustomers = [...byCustomer.values()].filter((c) => c.orders >= 2).length;
  const topCustomers = [...byCustomer.entries()]
    .map(([email, v]) => ({ email, name: v.name, orders: v.orders, totalSpent: round2(v.total) }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    currency,
    totalCustomers,
    repeatCustomers,
    repeatRate: totalCustomers > 0 ? repeatCustomers / totalCustomers : 0,
    topCustomers,
  };
}

export type LeadsSnapshot = {
  contactInquiries: number;
  businessInquiries: number;
  studioInquiries: number;
  affiliateApplications: number;
  totalLeads: number;
};

async function countInRange(table: string, from: Date | null, to: Date, excludeJunk: boolean): Promise<number> {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true }).lt("created_at", to.toISOString());
  if (from) query = query.gte("created_at", from.toISOString());
  if (excludeJunk) query = query.is("junked_at", null);
  const { count, error } = await query;
  if (error) throw new Error(`Failed to count ${table}: ${error.message}`);
  return count ?? 0;
}

// Sitewide, not business-line-scoped -- Contact/Business/Studio
// inquiries don't map cleanly onto one business line each, so this
// shows once per page as a top-of-funnel demand signal alongside the
// sales numbers, not split per tab. Junked (dismissed/spam) rows are
// excluded since they were never real leads.
export async function getLeadsSnapshot(range: ReportRangeBounds): Promise<LeadsSnapshot> {
  const [contactInquiries, businessInquiries, studioInquiries, affiliateApplications] = await Promise.all([
    countInRange("contact_inquiries", range.from, range.to, true),
    countInRange("wholesale_inquiries", range.from, range.to, true),
    countInRange("customisation_quotes", range.from, range.to, true),
    countInRange("affiliate_applications", range.from, range.to, false),
  ]);
  return {
    contactInquiries,
    businessInquiries,
    studioInquiries,
    affiliateApplications,
    totalLeads: contactInquiries + businessInquiries + studioInquiries + affiliateApplications,
  };
}
