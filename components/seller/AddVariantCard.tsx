"use client";

import { useState } from "react";
import { addVariant } from "@/api/sellerProductApi";
import { handleApiError } from "@/utils/handleApiError";

const INT32_MAX = 2147483647;

function toInt32(name: string, value: any, { min = 0, allowZero = true }: { min?: number; allowZero?: boolean } = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) throw new Error(`${name} must be a valid number`);
  const i = Math.trunc(n);

  if (!allowZero && i === 0) throw new Error(`${name} must be greater than 0`);
  if (i < min) throw new Error(`${name} must be >= ${min}`);
  if (i > INT32_MAX) throw new Error(`${name} is too large (max int32 is ${INT32_MAX})`);
  return i;
}

export default function AddVariantCard({
  productId,
  onUpdated,
}: {
  productId: string;
  onUpdated: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // required
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [retailPrice, setRetailPrice] = useState<number>(0);
  const [inStock, setInStock] = useState(true);
  const [stockQty, setStockQty] = useState<number>(1);
  const [weight, setWeight] = useState<number>(1);

  // optional toggles
  const [showRetailDiscount, setShowRetailDiscount] = useState(false);
  const [showWholesale, setShowWholesale] = useState(false);
  const [showWholesaleDiscount, setShowWholesaleDiscount] = useState(false);

  // optional values
  const [retailDiscount, setRetailDiscount] = useState<number>(0);
  const [retailDiscountType, setRetailDiscountType] = useState<"flat" | "percentage">("flat");

  const [wholesalePrice, setWholesalePrice] = useState<number>(0);
  const [minQtyWholesale, setMinQtyWholesale] = useState<number>(0);
  const [wholesaleDiscount, setWholesaleDiscount] = useState<number>(0);
  const [wholesaleDiscountType, setWholesaleDiscountType] = useState<"flat" | "percentage">("flat");

  async function submit() {
    try {
      if (!color.trim() || !size.trim()) {
        alert("Color and Size are required.");
        return;
      }

      const rp = toInt32("retail_price", retailPrice, { min: 1, allowZero: false });
      const sq = toInt32("stock_quantity", stockQty, { min: 0, allowZero: true });
      const wg = toInt32("weight_grams", weight, { min: 1, allowZero: false });

      const payload: any = {
        color: color.trim(),
        size: size.trim(),
        retail_price: rp,
        in_stock: inStock,
        stock_quantity: sq,
        weight_grams: wg,
      };

      if (showRetailDiscount) {
        const rd = toInt32("retail_discount", retailDiscount, { min: 1, allowZero: false });
        payload.retail_discount = rd;
        payload.retail_discount_type = retailDiscountType;
      }

      if (showWholesale) {
        const wp = toInt32("wholesale_price", wholesalePrice, { min: 1, allowZero: false });
        const mq = toInt32("min_qty_wholesale", minQtyWholesale, { min: 1, allowZero: false });
        payload.wholesale_price = wp;
        payload.min_qty_wholesale = mq;

        if (showWholesaleDiscount) {
          const wd = toInt32("wholesale_discount", wholesaleDiscount, { min: 1, allowZero: false });
          payload.wholesale_discount = wd;
          payload.wholesale_discount_type = wholesaleDiscountType;
        }
      }

      setSaving(true);
      await addVariant(productId, payload);
      await onUpdated();

      // reset
      setOpen(false);
      setColor("");
      setSize("");
      setRetailPrice(0);
      setInStock(true);
      setStockQty(1);
      setWeight(1);

      setShowRetailDiscount(false);
      setShowWholesale(false);
      setShowWholesaleDiscount(false);

      setRetailDiscount(0);
      setRetailDiscountType("flat");

      setWholesalePrice(0);
      setMinQtyWholesale(0);
      setWholesaleDiscount(0);
      setWholesaleDiscountType("flat");
    } catch (err: any) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Add a new variant</p>
          <p className="mt-1 text-sm text-gray-600">Create a new SKU under this product.</p>
        </div>

        <button
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          onClick={() => setOpen((x) => !x)}
        >
          {open ? "Close" : "Add variant"}
        </button>
      </div>

      {open ? (
        <div className="mt-4 space-y-4">
          {/* Required basics */}
          <div className="rounded-2xl border bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Required</p>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-600">Color *</p>
                <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" value={color} onChange={(e) => setColor(e.target.value)} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Size *</p>
                <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" value={size} onChange={(e) => setSize(e.target.value)} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Retail price *</p>
                <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={retailPrice} onChange={(e) => setRetailPrice(Number(e.target.value))} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Weight (grams) *</p>
                <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} />
              </div>

              <div className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
                <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
                <span className="text-sm font-medium text-gray-900">In stock</span>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-600">Stock quantity *</p>
                <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={stockQty} onChange={(e) => setStockQty(Number(e.target.value))} />
              </div>
            </div>
          </div>

          {/* Optional: retail discount */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">Retail discount (optional)</p>
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => setShowRetailDiscount((v) => !v)}
              >
                {showRetailDiscount ? "Remove fields" : "Add discount"}
              </button>
            </div>

            {showRetailDiscount ? (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-600">Retail discount amount</p>
                  <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={retailDiscount} onChange={(e) => setRetailDiscount(Number(e.target.value))} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Retail discount type</p>
                  <select className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" value={retailDiscountType} onChange={(e) => setRetailDiscountType(e.target.value as any)}>
                    <option value="flat">flat</option>
                    <option value="percentage">percentage</option>
                  </select>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">No retail discount will be added.</p>
            )}
          </div>

          {/* Optional: wholesale */}
          <div className="rounded-2xl border bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-gray-900">Wholesale mode (optional)</p>
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => {
                  const next = !showWholesale;
                  setShowWholesale(next);
                  if (!next) setShowWholesaleDiscount(false);
                }}
              >
                {showWholesale ? "Remove wholesale" : "Enable wholesale"}
              </button>
            </div>

            {showWholesale ? (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Wholesale price (required)</p>
                    <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={wholesalePrice} onChange={(e) => setWholesalePrice(Number(e.target.value))} />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Min qty wholesale (required)</p>
                    <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={minQtyWholesale} onChange={(e) => setMinQtyWholesale(Number(e.target.value))} />
                  </div>
                </div>

                <div className="rounded-2xl border bg-gray-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-900">Wholesale discount (optional)</p>
                    <button
                      className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                      onClick={() => setShowWholesaleDiscount((v) => !v)}
                    >
                      {showWholesaleDiscount ? "Remove fields" : "Add discount"}
                    </button>
                  </div>

                  {showWholesaleDiscount ? (
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-gray-600">Wholesale discount amount</p>
                        <input className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" type="number" value={wholesaleDiscount} onChange={(e) => setWholesaleDiscount(Number(e.target.value))} />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-600">Wholesale discount type</p>
                        <select className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm" value={wholesaleDiscountType} onChange={(e) => setWholesaleDiscountType(e.target.value as any)}>
                          <option value="flat">flat</option>
                          <option value="percentage">percentage</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-600">No wholesale discount will be added.</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-600">Wholesale mode will remain disabled.</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={submit}
              disabled={saving}
            >
              {saving ? "Creating..." : "Create variant"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}