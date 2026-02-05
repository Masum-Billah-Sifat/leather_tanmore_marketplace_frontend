"use client";

import { useMemo } from "react";

export type DiscountType = "flat" | "percentage";

export type VariantDraft = {
  _localId: string;

  color: string;
  size: string;

  retail_price: string;
  in_stock: boolean;
  stock_quantity: string;
  weight_grams: string;

  retailDiscountEnabled: boolean;
  retail_discount: string;
  retail_discount_type: DiscountType | "";

  wholesaleEnabled: boolean;
  wholesale_price: string;
  min_qty_wholesale: string;

  wholesaleDiscountEnabled: boolean;
  wholesale_discount: string;
  wholesale_discount_type: DiscountType | "";
};

type Props = {
  value: VariantDraft[];
  onChange: (next: VariantDraft[]) => void;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function VariantsEditor({ value, onChange }: Props) {
  const addVariant = () => {
    onChange([...value, VariantsEditor.createEmptyVariant()]);
  };

  const removeVariant = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next.length ? next : [VariantsEditor.createEmptyVariant()]);
  };

  const patch = (idx: number, partial: Partial<VariantDraft>) => {
    const next = value.map((v, i) => (i === idx ? { ...v, ...partial } : v));
    onChange(next);
  };

  return (
    <div className="space-y-5">
      {value.map((v, idx) => (
        <div key={v._localId} className="rounded-2xl border p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">
                Variant #{idx + 1}
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Required: color, size, retail price, stock qty, weight.
              </p>
            </div>

            <button
              type="button"
              onClick={() => removeVariant(idx)}
              className="rounded-xl border px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Color *">
              <input
                value={v.color}
                onChange={(e) => patch(idx, { color: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., Black"
              />
            </Field>

            <Field label="Size *">
              <input
                value={v.size}
                onChange={(e) => patch(idx, { size: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., M"
              />
            </Field>

            <Field label="Retail price *">
              <input
                type="number"
                value={v.retail_price}
                onChange={(e) => patch(idx, { retail_price: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="1450"
              />
            </Field>

            <Field label="Weight (grams) *">
              <input
                type="number"
                value={v.weight_grams}
                onChange={(e) => patch(idx, { weight_grams: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="500"
              />
            </Field>

            <div className="md:col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                checked={v.in_stock}
                onChange={(e) => patch(idx, { in_stock: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">In stock</span>
            </div>

            <Field label="Stock quantity *">
              <input
                type="number"
                value={v.stock_quantity}
                onChange={(e) => patch(idx, { stock_quantity: e.target.value })}
                className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="20"
              />
            </Field>
          </div>

          {/* Retail Discount */}
          <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Retail discount</p>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={v.retailDiscountEnabled}
                  onChange={(e) =>
                    patch(idx, {
                      retailDiscountEnabled: e.target.checked,
                      retail_discount: e.target.checked ? v.retail_discount : "",
                      retail_discount_type: e.target.checked ? v.retail_discount_type : "",
                    })
                  }
                  className="h-4 w-4"
                />
                Enable
              </label>
            </div>

            {v.retailDiscountEnabled ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Discount value">
                  <input
                    type="number"
                    value={v.retail_discount}
                    onChange={(e) => patch(idx, { retail_discount: e.target.value })}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                    placeholder="200"
                  />
                </Field>

                <Field label="Discount type">
                  <select
                    value={v.retail_discount_type}
                    onChange={(e) => patch(idx, { retail_discount_type: e.target.value as any })}
                    className="w-full rounded-xl border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                  >
                    <option value="">Select type</option>
                    <option value="flat">Flat</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </Field>
              </div>
            ) : null}
          </div>

          {/* Wholesale */}
          <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">Wholesale mode</p>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={v.wholesaleEnabled}
                  onChange={(e) =>
                    patch(idx, {
                      wholesaleEnabled: e.target.checked,
                      wholesale_price: e.target.checked ? v.wholesale_price : "",
                      min_qty_wholesale: e.target.checked ? v.min_qty_wholesale : "",
                      wholesaleDiscountEnabled: false,
                      wholesale_discount: "",
                      wholesale_discount_type: "",
                    })
                  }
                  className="h-4 w-4"
                />
                Enable
              </label>
            </div>

            {v.wholesaleEnabled ? (
              <>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Wholesale price">
                    <input
                      type="number"
                      value={v.wholesale_price}
                      onChange={(e) => patch(idx, { wholesale_price: e.target.value })}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                      placeholder="1200"
                    />
                  </Field>

                  <Field label="Min qty (wholesale)">
                    <input
                      type="number"
                      value={v.min_qty_wholesale}
                      onChange={(e) => patch(idx, { min_qty_wholesale: e.target.value })}
                      className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                      placeholder="5"
                    />
                  </Field>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Wholesale discount</p>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={v.wholesaleDiscountEnabled}
                      onChange={(e) =>
                        patch(idx, {
                          wholesaleDiscountEnabled: e.target.checked,
                          wholesale_discount: e.target.checked ? v.wholesale_discount : "",
                          wholesale_discount_type: e.target.checked ? v.wholesale_discount_type : "",
                        })
                      }
                      className="h-4 w-4"
                    />
                    Enable
                  </label>
                </div>

                {v.wholesaleDiscountEnabled ? (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Discount value">
                      <input
                        type="number"
                        value={v.wholesale_discount}
                        onChange={(e) => patch(idx, { wholesale_discount: e.target.value })}
                        className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                        placeholder="100"
                      />
                    </Field>

                    <Field label="Discount type">
                      <select
                        value={v.wholesale_discount_type}
                        onChange={(e) => patch(idx, { wholesale_discount_type: e.target.value as any })}
                        className="w-full rounded-xl border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                      >
                        <option value="">Select type</option>
                        <option value="flat">Flat</option>
                        <option value="percentage">Percentage</option>
                      </select>
                    </Field>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addVariant}
        className="w-full rounded-2xl border px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
      >
        + Add new variant
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: any }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

// static helper
VariantsEditor.createEmptyVariant = function createEmptyVariant(): VariantDraft {
  return {
    _localId: uid(),
    color: "",
    size: "",
    retail_price: "",
    in_stock: true,
    stock_quantity: "",
    weight_grams: "",
    retailDiscountEnabled: false,
    retail_discount: "",
    retail_discount_type: "",
    wholesaleEnabled: false,
    wholesale_price: "",
    min_qty_wholesale: "",
    wholesaleDiscountEnabled: false,
    wholesale_discount: "",
    wholesale_discount_type: "",
  };
};
