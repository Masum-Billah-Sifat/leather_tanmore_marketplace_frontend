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

const inputBase =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-[rgb(var(--text))] " +
  "placeholder:text-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]/30";

const labelBase = "text-xs font-semibold text-[rgb(var(--muted))]";

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
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-base font-semibold text-[rgb(var(--text))]">
            {mode === "add" ? "Add shipping address" : "Edit shipping address"}
          </div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            Required: name, phone, address, city/zone/area, payment method.
          </div>
        </div>

        <div className="rounded-full border border-black/10 bg-[rgb(var(--surface))] px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
          {mode === "add" ? "New" : "Edit"}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Recipient name *">
          <input
            value={vals.recipient_name}
            onChange={(e) => setField("recipient_name", e.target.value)}
            disabled={disabled}
            className={inputBase}
            placeholder="e.g., BPS"
          />
        </Field>

        <Field label="Recipient phone *">
          <input
            value={vals.recipient_phone}
            onChange={(e) => setField("recipient_phone", e.target.value)}
            disabled={disabled}
            className={inputBase}
            placeholder="e.g., 01XXXXXXXXX"
          />
        </Field>

        <Field label="Recipient email (optional)">
          <input
            value={vals.recipient_email}
            onChange={(e) => setField("recipient_email", e.target.value)}
            disabled={disabled}
            className={inputBase}
            placeholder="optional"
          />
        </Field>

        <Field label="Payment method *">
          <select
            value={vals.payment_method}
            onChange={(e) => setField("payment_method", e.target.value as any)}
            disabled={disabled}
            className={inputBase}
          >
            <option value="cod">Cash on delivery</option>
            <option value="prepaid">Prepaid</option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field label="Address line *">
            <textarea
              value={vals.address_line}
              onChange={(e) => setField("address_line", e.target.value)}
              disabled={disabled}
              className={inputBase}
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
              className={inputBase}
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
            className={inputBase}
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
            className={inputBase}
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
            className={inputBase}
          />
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className="rounded-2xl border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
          >
            Cancel
          </button>
        ) : null}

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !requiredOk || (mode === "edit" && !touched)}
          className="rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
        >
          {mode === "add" ? "Add shipping" : "Save changes"}
        </button>
      </div>

      {!requiredOk ? (
        <div className="mt-3 text-xs text-[rgb(var(--muted))]">
          Fill in all required fields to continue.
        </div>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className={labelBase}>{label}</div>
      {children}
    </div>
  );
}
