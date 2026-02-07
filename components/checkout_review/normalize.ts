// components/checkout_review/normalize.ts
import type { CheckoutReview } from "./types";

// Minimal nullable unwrap for sqlc/go null-json
function unwrapNullable(v: any): any {
  if (v === null || v === undefined) return null;
  if (typeof v === "object" && v && "Valid" in v) {
    if (!v.Valid) return null;
    if ("String" in v) return v.String ?? null;
    if ("UUID" in v) return v.UUID ?? null;
    if ("Time" in v) return v.Time ?? null;
    return null;
  }
  return v;
}

export function normalizeCheckoutReview(raw: any): CheckoutReview {
  const d = raw ?? {};

  const shipping = d.shipping_address ? { ...d.shipping_address } : null;
  const shipping_address = shipping
    ? {
        ...shipping,
        recipient_email: unwrapNullable(shipping.recipient_email),
        delivery_note: unwrapNullable(shipping.delivery_note),
        latitude: unwrapNullable(shipping.latitude),
        longitude: unwrapNullable(shipping.longitude),
        created_at: unwrapNullable(shipping.created_at) ?? shipping.created_at,
      }
    : null;

  const platform_discount = d.platform_discount ?? {};
  const normalized_platform_discount = {
    type: unwrapNullable(platform_discount.type),
    value: unwrapNullable(platform_discount.value),
    amount_applied: unwrapNullable(platform_discount.amount_applied),
  };

  const valid_items = Array.isArray(d.valid_items) ? d.valid_items : [];
  const normalized_valid_items = valid_items.map((it: any) => ({
    ...it,
    discount_type: unwrapNullable(it.discount_type),
    discount_value: unwrapNullable(it.discount_value),
  }));

  const invalid_items = Array.isArray(d.invalid_items) ? d.invalid_items : [];

  return {
    checkout_session_id: String(d.checkout_session_id ?? ""),
    shipping_address,
    payment_method: (d.payment_method ?? "cod") as "cod" | "prepaid",
    subtotal: String(d.subtotal ?? "0.00"),
    delivery_charge: unwrapNullable(d.delivery_charge),
    total_weight_grams: Number(d.total_weight_grams ?? 0),
    platform_discount: normalized_platform_discount,
    total_payable: String(d.total_payable ?? "0.00"),
    valid_items: normalized_valid_items,
    invalid_items,
  };
}
