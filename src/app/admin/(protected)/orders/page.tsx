import Link from "next/link";
import { listOrders, type BusinessLine, type OrderStatus } from "@/lib/admin/orders";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, type PaymentStatus } from "@/lib/admin/order-constants";
import { formatMoney } from "@/lib/format-money";
import { StatusBadge, type StatusTier } from "@/components/admin/status-badge";

const BUSINESS_LINE_TABS: { value: BusinessLine | "all"; label: string }[] = [
  { value: "all", label: "All Orders" },
  { value: "collection", label: "Aurielle Collection" },
  { value: "atelier_supply", label: "Atelier Supply" },
];

function isBusinessLine(value: string | undefined): value is BusinessLine {
  return value === "collection" || value === "atelier_supply";
}

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value ?? "");
}

// One hue ramping up through the fulfillment pipeline (pending -> to
// pack -> to ship), then the brand accent at "shipped" and a distinct
// negative tier for "cancelled" -- see status-badge.tsx.
const ORDER_STATUS_TIER: Record<OrderStatus, StatusTier> = {
  pending_verification: "neutral",
  to_pack: "progress",
  to_ship: "progressStrong",
  shipped_out: "positive",
  cancelled: "negative",
};

const PAYMENT_STATUS_TIER: Record<PaymentStatus, StatusTier> = {
  pending: "neutral",
  paid: "positive",
  failed: "negative",
  refunded: "muted",
};

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const params = await searchParams;
  const businessLineParam = Array.isArray(params.businessLine) ? params.businessLine[0] : params.businessLine;
  const businessLine = isBusinessLine(businessLineParam) ? businessLineParam : undefined;
  const statusParam = Array.isArray(params.status) ? params.status[0] : params.status;
  const orderStatus = isOrderStatus(statusParam) ? statusParam : undefined;
  const searchParam = Array.isArray(params.search) ? params.search[0] : params.search;
  const search = searchParam ?? "";

  const orders = await listOrders({ businessLine, orderStatus, search: search || undefined });

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Order Management</h1>
      <p className="mt-1 text-sm text-ink/60">
        Orders start life as &ldquo;Pending Verification&rdquo; while proof of payment is checked
        manually (GCash / bank transfer, no live payment gateway).
      </p>

      <div className="mt-6 flex gap-2 border-b border-taupe/20">
        {BUSINESS_LINE_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/orders" : `/admin/orders?businessLine=${tab.value}`}
            className={`border-b-2 px-4 py-2 text-sm transition-colors ${
              (businessLine ?? "all") === tab.value
                ? "border-burgundy text-burgundy"
                : "border-transparent text-ink/60 hover:text-ink"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <form method="get" className="mt-6 flex flex-wrap gap-3">
        {businessLine && <input type="hidden" name="businessLine" value={businessLine} />}
        <input
          type="search"
          name="search"
          defaultValue={search}
          placeholder="Search order #, name, or email..."
          className="w-full max-w-sm rounded-sm border border-taupe/40 bg-white px-4 py-2 text-sm outline-none focus:border-burgundy"
        />
        <select
          name="status"
          defaultValue={orderStatus ?? ""}
          className="rounded-sm border border-taupe/40 bg-white px-4 py-2 text-sm outline-none focus:border-burgundy"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button type="submit" className="border border-taupe/40 px-4 py-2 text-sm text-ink/70">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto border border-taupe/20 bg-white">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
            <tr>
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Line</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-taupe/10 transition-colors last:border-0 hover:bg-beige/30">
                <td className="px-4 py-3 text-ink">
                  <span className="flex items-center gap-2">
                    {!order.viewedAt && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-burgundy"
                        aria-label="Unviewed"
                        title="Unviewed"
                      />
                    )}
                    {order.orderNumber}
                  </span>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  <div>{order.customerName}</div>
                  <div className="text-xs text-ink/50">{order.customerEmail}</div>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {order.businessLine === "collection" ? "Aurielle Collection" : "Atelier Supply"}
                </td>
                <td className="px-4 py-3 text-ink/70">{formatMoney(order.currency, order.total)}</td>
                <td className="px-4 py-3">
                  <StatusBadge tier={PAYMENT_STATUS_TIER[order.paymentStatus]}>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge tier={ORDER_STATUS_TIER[order.orderStatus]}>
                    {ORDER_STATUS_LABELS[order.orderStatus]}
                  </StatusBadge>
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-xs uppercase tracking-wide text-burgundy underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-ink/50">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
