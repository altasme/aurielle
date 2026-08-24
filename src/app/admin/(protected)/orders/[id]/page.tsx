import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder, markOrderViewed, type Address } from "@/lib/admin/orders";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { OrderProofViewer } from "@/components/admin/order-proof-viewer";
import { formatMoney } from "@/lib/format-money";

function formatAddress(address: Address): string {
  return [address.address, address.city, address.stateProvince, address.postalCode, address.country]
    .filter(Boolean)
    .join(", ");
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  gcash: "GCash",
  bank_transfer: "Bank Transfer",
  stripe: "Card (Stripe)",
};

export default async function AdminOrderDetailPage({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();
  await markOrderViewed(id);

  return (
    <div>
      <Link href="/admin/orders" className="text-xs uppercase tracking-wide text-burgundy underline">
        &larr; All Orders
      </Link>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-ink">Order {order.orderNumber}</h1>
          <p className="mt-1 text-sm text-ink/60">
            Placed {new Date(order.createdAt).toLocaleString()} &middot;{" "}
            {order.businessLine === "collection" ? "Aurielle Collection" : "Atelier Supply"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="border border-taupe/20 bg-white p-6">
            <h2 className="font-serif text-lg text-ink">Items</h2>
            <table className="mt-4 w-full text-left text-sm">
              <thead className="border-b border-taupe/20 text-xs uppercase tracking-wide text-ink/50">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2">Qty</th>
                  <th className="py-2">Unit Price</th>
                  <th className="py-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id} className="border-b border-taupe/10 last:border-0">
                    <td className="py-2 text-ink">{item.nameSnapshot}</td>
                    <td className="py-2 text-ink/70">
                      {item.quantity}
                      {item.pricingUnit ? ` ${item.pricingUnit}` : ""}
                    </td>
                    <td className="py-2 text-ink/70">{formatMoney(item.currency, item.unitPrice)}</td>
                    <td className="py-2 text-right text-ink/70">{formatMoney(item.currency, item.lineSubtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 space-y-1 border-t border-taupe/20 pt-4 text-right text-sm">
              <p className="text-ink/60">Subtotal: {formatMoney(order.currency, order.subtotal)}</p>
              <p className="text-ink/60">Shipping: {formatMoney(order.currency, order.shippingCost)}</p>
              <p className="font-medium text-ink">Total: {formatMoney(order.currency, order.total)}</p>
            </div>
          </div>

          <div className="border border-taupe/20 bg-white p-6">
            <h2 className="font-serif text-lg text-ink">Customer</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/50">Contact</p>
                <p className="mt-1 text-sm text-ink">{order.customerName}</p>
                <p className="text-sm text-ink/70">{order.customerEmail}</p>
                {order.customerPhone && <p className="text-sm text-ink/70">{order.customerPhone}</p>}
                <p className="text-sm text-ink/70">{order.customerCountry}</p>
              </div>
              {order.shippingSameAsBilling ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink/50">Shipping Address</p>
                  <p className="mt-1 text-sm text-ink/70">{formatAddress(order.shippingAddress)}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink/50">Billing Address</p>
                    <p className="mt-1 text-sm text-ink/70">{formatAddress(order.billingAddress)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-ink/50">Shipping Address</p>
                    <p className="mt-1 text-sm text-ink/70">{formatAddress(order.shippingAddress)}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {(order.courierName || order.trackingNumber) && (
            <div className="border border-taupe/20 bg-white p-6">
              <h2 className="font-serif text-lg text-ink">Shipment</h2>
              <p className="mt-2 text-sm text-ink/70">Courier: {order.courierName ?? "—"}</p>
              <p className="text-sm text-ink/70">Tracking Number: {order.trackingNumber ?? "—"}</p>
            </div>
          )}

          <div className="border border-taupe/20 bg-white p-6">
            <h2 className="font-serif text-lg text-ink">Payment</h2>
            <p className="mt-2 text-sm text-ink/70">
              Method: {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
            </p>
            <div className="mt-4">
              {order.proofPath ? (
                <OrderProofViewer orderId={order.id} />
              ) : (
                <p className="text-sm text-ink/50">No proof of payment uploaded.</p>
              )}
            </div>
          </div>
        </div>

        <div className="border border-taupe/20 bg-white p-6 lg:sticky lg:top-8 lg:h-fit">
          <h2 className="font-serif text-lg text-ink">Status</h2>
          <div className="mt-4">
            <OrderStatusForm order={order} />
          </div>
        </div>
      </div>
    </div>
  );
}
