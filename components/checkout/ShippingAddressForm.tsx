// components/checkout/ShippingAddressForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export type ShippingFormMode = "add" | "edit" | "view";

export type ShippingFormValues = {
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  address_line: string;
  delivery_note: string;
  city_id: number;
  zone_id: number;
  area_id: number;
  payment_method: "cod" | "prepaid";
};

const DEFAULTS: ShippingFormValues = {
  recipient_name: "",
  recipient_phone: "",
  recipient_email: "",
  address_line: "",
  delivery_note: "",
  city_id: 1,
  zone_id: 1,
  area_id: 1,
  payment_method: "cod",
};

export default function ShippingAddressForm({
  mode,
  disabled,
  initialValues,
  onSubmit,
  onCancel,
}: {
  mode: "add" | "edit";
  disabled: boolean;
  initialValues: ShippingFormValues | null;
  onSubmit: (vals: ShippingFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [vals, setVals] = useState<ShippingFormValues>(initialValues ?? DEFAULTS);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setVals(initialValues ?? DEFAULTS);
    setTouched(false);
  }, [initialValues, mode]);

  const requiredOk = useMemo(() => {
    // for add: strict required fields
    // for edit: we still require the core fields, because you said “show all fields and allow edit”
    // (you can loosen later; backend supports partial updates anyway)
    return (
      vals.recipient_name.trim().length > 0 &&
      vals.recipient_phone.trim().length > 0 &&
      vals.address_line.trim().length > 0 &&
      Number(vals.city_id) >= 1 &&
      Number(vals.zone_id) >= 1 &&
      Number(vals.area_id) >= 1 &&
      (vals.payment_method === "cod" || vals.payment_method === "prepaid")
    );
  }, [vals]);

  const setField = (k: keyof ShippingFormValues, v: any) => {
    setTouched(true);
    setVals((p) => ({ ...p, [k]: v }));
  };

  const submit = async () => {
    if (!requiredOk) return;
    await onSubmit(vals);
  };

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="text-sm font-semibold text-gray-900">
        {mode === "add" ? "Add shipping address" : "Edit shipping address"}
      </div>

      <div className="mt-2 text-xs text-gray-600">
        Required: name, phone, address_line, city_id, zone_id, area_id, payment_method. Optional: email, delivery_note.
        <div className="mt-1">
          For now, enter any number 1–100 for city/zone/area (temporary).
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Recipient name *">
          <input
            value={vals.recipient_name}
            onChange={(e) => setField("recipient_name", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="e.g., BPS"
          />
        </Field>

        <Field label="Recipient phone *">
          <input
            value={vals.recipient_phone}
            onChange={(e) => setField("recipient_phone", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="e.g., 01XXXXXXXXX"
          />
        </Field>

        <Field label="Recipient email (optional)">
          <input
            value={vals.recipient_email}
            onChange={(e) => setField("recipient_email", e.target.value)}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="optional"
          />
        </Field>

        <Field label="Payment method *">
          <select
            value={vals.payment_method}
            onChange={(e) => setField("payment_method", e.target.value as any)}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          >
            <option value="cod">cod</option>
            <option value="prepaid">prepaid</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Address line *">
            <textarea
              value={vals.address_line}
              onChange={(e) => setField("address_line", e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="House/Road/Area details"
              rows={3}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Delivery note (optional)">
            <input
              value={vals.delivery_note}
              onChange={(e) => setField("delivery_note", e.target.value)}
              disabled={disabled}
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="optional"
            />
          </Field>
        </div>

        <Field label="City ID * (1–100)">
          <input
            type="number"
            min={1}
            max={100}
            value={vals.city_id}
            onChange={(e) => setField("city_id", Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Zone ID * (1–100)">
          <input
            type="number"
            min={1}
            max={100}
            value={vals.zone_id}
            onChange={(e) => setField("zone_id", Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Area ID * (1–100)">
          <input
            type="number"
            min={1}
            max={100}
            value={vals.area_id}
            onChange={(e) => setField("area_id", Number(e.target.value))}
            disabled={disabled}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !requiredOk || (mode === "edit" && !touched)}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
        >
          {mode === "add" ? "Add shipping" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-gray-700">{label}</div>
      {children}
    </div>
  );
}
