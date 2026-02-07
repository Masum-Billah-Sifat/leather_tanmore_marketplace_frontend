// components/checkout/normalize.ts
import type { CheckoutDetails } from "./types";

// Handles sqlc/go nullable JSON like:
// { String: "...", Valid: true }  OR  { UUID: "...", Valid: true }  OR  { Time: "...", Valid: true }
function unwrapNullable(v: any): any {
  if (v === null || v === undefined) return null;

  if (typeof v === "object" && v && "Valid" in v) {
    const valid = Boolean(v.Valid);
    if (!valid) return null;

    if ("String" in v) return v.String ?? null;
    if ("UUID" in v) return v.UUID ?? null;
    if ("Time" in v) return v.Time ?? null;

    // unknown nullable struct shape
    return null;
  }

  return v;
}

export function normalizeCheckoutDetails(raw: any): CheckoutDetails {
  const d = raw ?? {};

  // checkout_session
  const s = d.checkout_session ?? {};
  const checkout_session = {
    ...s,
    delivery_charge: unwrapNullable(s.delivery_charge),
    shipping_address_id: unwrapNullable(s.shipping_address_id),
    platform_discount_type: unwrapNullable(s.platform_discount_type),
    platform_discount_value: unwrapNullable(s.platform_discount_value),
    platform_discount_amount_applied: unwrapNullable(s.platform_discount_amount_applied),
  };

  // shipping_address
  const ship = d.shipping_address ? { ...d.shipping_address } : null;
  const shipping_address = ship
    ? {
        ...ship,
        recipient_email: unwrapNullable(ship.recipient_email),
        delivery_note: unwrapNullable(ship.delivery_note),
        latitude: unwrapNullable(ship.latitude),
        longitude: unwrapNullable(ship.longitude),
        created_at: unwrapNullable(ship.created_at) ?? ship.created_at,
      }
    : null;

  // valid_items
  const valid_items = Array.isArray(d.valid_items) ? d.valid_items : [];
  const normalized_valid_items = valid_items.map((it: any) => ({
    ...it,
    discount_type: unwrapNullable(it.discount_type),
    discount_value: unwrapNullable(it.discount_value),
  }));

  // invalid_items
  const invalid_items = Array.isArray(d.invalid_items) ? d.invalid_items : [];

  return {
    checkout_session,
    has_shipping_address_details: Boolean(d.has_shipping_address_details),
    shipping_address,
    valid_items: normalized_valid_items,
    invalid_items,
  };
}
