// components/checkout_review/ReviewSummaryMeta.tsx
"use client";

import type { CheckoutReview } from "./types";

export default function ReviewSummaryMeta({ review }: { review: CheckoutReview }) {
  const pd = review.platform_discount ?? {};

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-gray-900">Final summary</div>

      <div className="mt-3 space-y-2 text-sm">
        <Row label="Payment method" value={review.payment_method} />
        <Row label="Subtotal" value={`৳${review.subtotal}`} />
        <Row label="Delivery" value={review.delivery_charge ? `৳${review.delivery_charge}` : "—"} />
        <Row label="Weight" value={`${review.total_weight_grams}g`} />

        {(pd.type || pd.value || pd.amount_applied) ? (
          <div className="mt-3 rounded-xl border bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-800">Platform discount</div>
            <div className="mt-1 text-xs text-gray-700">
              Type: {pd.type ?? "—"} • Value: {pd.value ?? "—"} • Applied: {pd.amount_applied ?? "—"}
            </div>
          </div>
        ) : null}

        <div className="pt-3 flex items-center justify-between">
          <span className="text-gray-600">Total payable</span>
          <span className="text-lg font-semibold text-gray-900">৳{review.total_payable}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
