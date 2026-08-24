"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FIELD_CLASSES } from "@/components/form-field";
import { SubmitButton } from "@/components/submit-button";
import { useSubmit } from "@/lib/use-submit";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin/order-constants";
import type { OrderDetail } from "@/lib/admin/orders";

export function OrderStatusForm({ order }: { order: OrderDetail }) {
  const router = useRouter();
  const { submitting, error, submit } = useSubmit();
  const [orderStatus, setOrderStatus] = useState<OrderStatus>(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaved(false);
    const result = await submit(async () => {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update order");
      return data;
    });
    if (result) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Order Status</label>
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
          className={`mt-2 ${FIELD_CLASSES}`}
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-xs uppercase tracking-wide text-ink/60">Payment Status</label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          className={`mt-2 ${FIELD_CLASSES}`}
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {PAYMENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && !error && <p className="text-sm text-green-700">Saved.</p>}
      <SubmitButton pending={submitting} pendingLabel="Saving...">
        Save Status
      </SubmitButton>
    </form>
  );
}
