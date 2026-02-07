// components/checkout_review/ReviewShippingCard.tsx
"use client";

import type { ReviewShippingAddress } from "./types";

export default function ReviewShippingCard({ shipping }: { shipping: ReviewShippingAddress | null }) {
  if (!shipping) {
    return (
      <div className="rounded-2xl border bg-yellow-50 p-4">
        <div className="text-sm font-semibold text-yellow-900">Shipping address missing</div>
        <div className="mt-1 text-sm text-yellow-800">
          You must add shipping address before confirming the order.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold text-gray-900">Shipping address</div>
      <div className="mt-2 text-sm text-gray-700 space-y-1">
        <div>
          <span className="text-gray-500">Name:</span> {shipping.recipient_name}
        </div>
        <div>
          <span className="text-gray-500">Phone:</span> {shipping.recipient_phone}
        </div>
        {shipping.recipient_email ? (
          <div>
            <span className="text-gray-500">Email:</span> {shipping.recipient_email}
          </div>
        ) : null}
        <div className="pt-2">
          <span className="text-gray-500">Address:</span> {shipping.address_line}
        </div>
        {shipping.delivery_note ? (
          <div>
            <span className="text-gray-500">Note:</span> {shipping.delivery_note}
          </div>
        ) : null}
        <div className="pt-2 text-xs text-gray-600">
          city_id={shipping.city_id} • zone_id={shipping.zone_id} • area_id={shipping.area_id}
        </div>
      </div>
    </div>
  );
}
