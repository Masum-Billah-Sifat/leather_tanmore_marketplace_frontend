// components/checkout/ShippingAddressSection.tsx
"use client";

import { useMemo, useState } from "react";
import type { CheckoutDetails, ShippingAddress } from "./types";
import { addShippingAddress, editShippingAddress } from "./api";
import { handleApiError } from "@/utils/handleApiError";
import ShippingAddressForm, { ShippingFormMode, ShippingFormValues } from "./ShippingAddressForm";

export default function ShippingAddressSection({
  sessionId,
  loading,
  details,
  onChanged,
}: {
  sessionId: string;
  loading: boolean;
  details: CheckoutDetails | null;
  onChanged: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const hasShipping = !!details?.has_shipping_address_details && !!details?.shipping_address;
  const shipping = details?.shipping_address ?? null;

  const mode: ShippingFormMode = useMemo(() => {
    if (!hasShipping) return "add";
    return editMode ? "edit" : "view";
  }, [hasShipping, editMode]);

  const initialValues: ShippingFormValues | null = useMemo(() => {
    if (!shipping) return null;
    return {
      recipient_name: shipping.recipient_name ?? "",
      recipient_phone: shipping.recipient_phone ?? "",
      recipient_email: shipping.recipient_email ?? "",
      address_line: shipping.address_line ?? "",
      delivery_note: shipping.delivery_note ?? "",
      city_id: shipping.city_id ?? 1,
      zone_id: shipping.zone_id ?? 1,
      area_id: shipping.area_id ?? 1,
      payment_method: (details?.checkout_session?.payment_method ?? "cod") as "cod" | "prepaid",
    };
  }, [shipping, details?.checkout_session?.payment_method]);

  const submitAdd = async (vals: ShippingFormValues) => {
    setBusy(true);
    try {
      const body = {
        recipient_name: vals.recipient_name.trim(),
        recipient_phone: vals.recipient_phone.trim(),
        recipient_email: vals.recipient_email.trim() ? vals.recipient_email.trim() : null,
        address_line: vals.address_line.trim(),
        delivery_note: vals.delivery_note.trim() ? vals.delivery_note.trim() : null,
        city_id: Number(vals.city_id),
        zone_id: Number(vals.zone_id),
        area_id: Number(vals.area_id),
        payment_method: vals.payment_method,
        // latitude/longitude intentionally omitted
      };
      await addShippingAddress(sessionId, body);
      await onChanged();
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const submitEdit = async (vals: ShippingFormValues) => {
    if (!shipping?.id) return;

    setBusy(true);
    try {
      // send only changed keys (PATCH-like semantics via PUT)
      const patch: Record<string, any> = {};

      const base = initialValues;
      if (!base) return;

      const setIfChanged = (k: keyof ShippingFormValues, next: any) => {
        const prev = (base as any)[k];
        if (String(prev ?? "") !== String(next ?? "")) patch[k] = next;
      };

      setIfChanged("recipient_name", vals.recipient_name.trim());
      setIfChanged("recipient_phone", vals.recipient_phone.trim());

      // Optional strings:
      // For now: if empty, we OMIT (so user can’t “clear” them). Keeps backend safe.
      if (vals.recipient_email.trim() && vals.recipient_email.trim() !== (base.recipient_email ?? "")) {
        patch.recipient_email = vals.recipient_email.trim();
      }
      if (vals.delivery_note.trim() && vals.delivery_note.trim() !== (base.delivery_note ?? "")) {
        patch.delivery_note = vals.delivery_note.trim();
      }
      setIfChanged("address_line", vals.address_line.trim());

      setIfChanged("city_id", Number(vals.city_id));
      setIfChanged("zone_id", Number(vals.zone_id));
      setIfChanged("area_id", Number(vals.area_id));
      setIfChanged("payment_method", vals.payment_method);

      // If nothing changed, just exit edit mode
      if (Object.keys(patch).length === 0) {
        setEditMode(false);
        return;
      }

      await editShippingAddress(sessionId, shipping.id, patch);
      setEditMode(false);
      await onChanged();
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  if (!details) {
    return <div className="text-sm text-gray-600">Load checkout details to manage shipping.</div>;
  }

  if (!hasShipping) {
    return (
      <ShippingAddressForm
        mode="add"
        disabled={loading || busy}
        initialValues={null}
        onSubmit={submitAdd}
      />
    );
  }

  if (!shipping) {
    return <div className="text-sm text-gray-600">Shipping flag is true, but shipping object is missing.</div>;
  }

  return (
    <div className="space-y-3">
      {!editMode ? (
        <div className="rounded-2xl border bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">Shipping address</div>
              <div className="mt-2 text-sm text-gray-700">
                <div><span className="text-gray-500">Name:</span> {shipping.recipient_name}</div>
                <div><span className="text-gray-500">Phone:</span> {shipping.recipient_phone}</div>
                {shipping.recipient_email ? (
                  <div><span className="text-gray-500">Email:</span> {shipping.recipient_email}</div>
                ) : null}
                <div className="mt-2">
                  <span className="text-gray-500">Address:</span> {shipping.address_line}
                </div>
                {shipping.delivery_note ? (
                  <div><span className="text-gray-500">Note:</span> {shipping.delivery_note}</div>
                ) : null}
                <div className="mt-2 text-xs text-gray-600">
                  city_id={shipping.city_id} • zone_id={shipping.zone_id} • area_id={shipping.area_id}
                </div>
              </div>
            </div>

            <button
              onClick={() => setEditMode(true)}
              disabled={loading || busy}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
            >
              Edit
            </button>
          </div>
        </div>
      ) : (
        <ShippingAddressForm
          mode="edit"
          disabled={loading || busy}
          initialValues={initialValues}
          onCancel={() => setEditMode(false)}
          onSubmit={submitEdit}
        />
      )}
    </div>
  );
}
