"use client";

import { useEffect, useMemo, useState } from "react";
import type { SellerVariant } from "@/types/sellerProducts";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { handleApiError } from "@/utils/handleApiError";
import {
  archiveVariant,
  updateVariantInfo,
  updateVariantRetailPrice,
  updateVariantInStock,
  updateVariantStockQty,
  updateVariantWeight,
  addRetailDiscount,
  updateRetailDiscount,
  removeRetailDiscount,
  enableWholesaleMode,
  updateWholesaleMode,
  disableWholesaleMode,
  addWholesaleDiscount,
  updateWholesaleDiscount,
  removeWholesaleDiscount,
} from "@/api/sellerProductApi";

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

function asNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function VariantCardEditable({
  productId,
  variant,
  onUpdated,
}: {
  productId: string;
  variant: SellerVariant;
  onUpdated: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);

  // ---- edit toggles (view-first UI) ----
  const [editInfo, setEditInfo] = useState(false);
  const [editStockQty, setEditStockQty] = useState(false);
  const [editWeight, setEditWeight] = useState(false);
  const [editRetailPrice, setEditRetailPrice] = useState(false);

  const [showAddRetailDiscount, setShowAddRetailDiscount] = useState(false);
  const [showEditRetailDiscount, setShowEditRetailDiscount] = useState(false);

  const [showEnableWholesale, setShowEnableWholesale] = useState(false);
  const [showEnableWholesaleDiscount, setShowEnableWholesaleDiscount] = useState(false);

  const [showAddWholesaleDiscount, setShowAddWholesaleDiscount] = useState(false);
  const [showEditWholesaleInfo, setShowEditWholesaleInfo] = useState(false);
  const [showEditWholesaleDiscount, setShowEditWholesaleDiscount] = useState(false);

  // ---- derived flags from server truth (so UI updates after refresh) ----
  const retailHasDiscount = !!variant.has_retail_discount;

  const wholesaleEnabled = !!variant.has_wholesale_enabled;

  const wholesalePriceCurrent = asNumber((variant as any).wholesale_price, 0);
  const minQtyWholesaleCurrent =
    asNumber((variant as any).wholesale_min_quantity, NaN) ||
    asNumber((variant as any).wholesale_min_qty, NaN) ||
    asNumber((variant as any).wholesale_min_qty_wholesale, NaN) ||
    0;

  const wholesaleDiscountCurrent = asNumber((variant as any).wholesale_discount, 0);
  const wholesaleDiscountTypeCurrent = ((variant as any).wholesale_discount_type as any) === "percentage" ? "percentage" : "flat";

  const wholesaleHasDiscount = useMemo(() => wholesaleEnabled && wholesaleDiscountCurrent > 0, [wholesaleEnabled, wholesaleDiscountCurrent]);

  // ---- drafts (only used when editing) ----
  const [draftColor, setDraftColor] = useState(variant.color || "");
  const [draftSize, setDraftSize] = useState(variant.size || "");

  const [draftStockQty, setDraftStockQty] = useState<number>(variant.stock_quantity ?? 0);
  const [draftWeight, setDraftWeight] = useState<number>(variant.weight_grams ?? 0);
  const [draftRetailPrice, setDraftRetailPrice] = useState<number>(variant.retail_price ?? 0);

  const [draftRetailDiscount, setDraftRetailDiscount] = useState<number>(variant.retail_discount ?? 0);
  const [draftRetailDiscountType, setDraftRetailDiscountType] = useState<"flat" | "percentage">(
    (variant.retail_discount_type as any) === "percentage" ? "percentage" : "flat"
  );

  const [draftWholesalePrice, setDraftWholesalePrice] = useState<number>(wholesalePriceCurrent);
  const [draftWholesaleMinQty, setDraftWholesaleMinQty] = useState<number>(minQtyWholesaleCurrent);
  const [draftWholesaleDiscount, setDraftWholesaleDiscount] = useState<number>(wholesaleDiscountCurrent);
  const [draftWholesaleDiscountType, setDraftWholesaleDiscountType] = useState<"flat" | "percentage">(wholesaleDiscountTypeCurrent);

  // ---- reset drafts + close edit panels when server variant changes ----
  useEffect(() => {
    setDraftColor(variant.color || "");
    setDraftSize(variant.size || "");
    setDraftStockQty(variant.stock_quantity ?? 0);
    setDraftWeight(variant.weight_grams ?? 0);
    setDraftRetailPrice(variant.retail_price ?? 0);

    setDraftRetailDiscount(variant.retail_discount ?? 0);
    setDraftRetailDiscountType((variant.retail_discount_type as any) === "percentage" ? "percentage" : "flat");

    setDraftWholesalePrice(wholesalePriceCurrent);
    setDraftWholesaleMinQty(minQtyWholesaleCurrent);
    setDraftWholesaleDiscount(wholesaleDiscountCurrent);
    setDraftWholesaleDiscountType(wholesaleDiscountTypeCurrent);

    // close edit UI so it never stays stale after refresh
    setEditInfo(false);
    setEditStockQty(false);
    setEditWeight(false);
    setEditRetailPrice(false);

    setShowAddRetailDiscount(false);
    setShowEditRetailDiscount(false);

    setShowEnableWholesale(false);
    setShowEnableWholesaleDiscount(false);
    setShowAddWholesaleDiscount(false);
    setShowEditWholesaleInfo(false);
    setShowEditWholesaleDiscount(false);
  }, [
    variant.variant_id,
    variant.color,
    variant.size,
    variant.stock_quantity,
    variant.weight_grams,
    variant.retail_price,
    variant.has_retail_discount,
    variant.retail_discount,
    variant.retail_discount_type,
    variant.has_wholesale_enabled,
    wholesalePriceCurrent,
    minQtyWholesaleCurrent,
    wholesaleDiscountCurrent,
    wholesaleDiscountTypeCurrent,
  ]);

  async function run(fn: () => Promise<any>) {
    setBusy(true);
    try {
      await fn();
      await onUpdated(); // parent refetches -> UI updates from server truth
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusy(false);
    }
  }

  const inStock = !!variant.is_in_stock;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            Color: <span className="font-medium">{variant.color}</span> • Size:{" "}
            <span className="font-medium">{variant.size}</span>
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {inStock ? "In stock" : "Out of stock"} • Qty {variant.stock_quantity ?? 0} • {variant.weight_grams ?? 0}g
          </p>
        </div>

        <button
          className="rounded-xl border bg-white px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
          onClick={() => setOpenArchive(true)}
          disabled={busy}
        >
          Archive
        </button>
      </div>

      {/* Variant Info (Color/Size) */}
      <div className="mt-5 rounded-2xl border bg-gray-50 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-gray-900">Variant info</p>
          {!editInfo ? (
            <button
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
              onClick={() => setEditInfo(true)}
              disabled={busy}
            >
              Update variant info
            </button>
          ) : null}
        </div>

        {!editInfo ? (
          <div className="mt-3 text-sm text-gray-700">
            <p>
              Color: <span className="font-medium">{variant.color}</span>
            </p>
            <p className="mt-1">
              Size: <span className="font-medium">{variant.size}</span>
            </p>
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-gray-600">Color</p>
              <input
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={draftColor}
                placeholder={variant.color}
                onChange={(e) => setDraftColor(e.target.value)}
                disabled={busy}
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Size</p>
              <input
                className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                value={draftSize}
                placeholder={variant.size}
                onChange={(e) => setDraftSize(e.target.value)}
                disabled={busy}
              />
            </div>

            <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => setEditInfo(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                disabled={
                  busy ||
                  (draftColor.trim() === (variant.color || "") && draftSize.trim() === (variant.size || "")) ||
                  (!draftColor.trim() && !draftSize.trim())
                }
                onClick={() =>
                  run(() =>
                    updateVariantInfo(productId, variant.variant_id, {
                      ...(draftColor.trim() !== (variant.color || "") ? { color: draftColor.trim() } : {}),
                      ...(draftSize.trim() !== (variant.size || "") ? { size: draftSize.trim() } : {}),
                    })
                  )
                }
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Inventory */}
      <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Inventory</p>
            <p className="mt-1 text-sm text-gray-600">
              {inStock ? "Currently in stock" : "Out of stock"}.
            </p>
          </div>

          <label className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2">
            <input
              type="checkbox"
              checked={inStock}
              disabled={busy}
              onChange={(e) => run(() => updateVariantInStock(productId, variant.variant_id, e.target.checked))}
            />
            <span className="text-sm font-medium text-gray-900">In stock</span>
          </label>
        </div>

        {/* Stock quantity */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">Stock quantity</p>
            {!editStockQty ? (
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => setEditStockQty(true)}
                disabled={busy}
              >
                Update
              </button>
            ) : null}
          </div>

          {!editStockQty ? (
            <p className="mt-2 text-sm text-gray-700">
              Current: <span className="font-semibold">{variant.stock_quantity ?? 0}</span>
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600">New stock quantity (0 to int32 max)</p>
                <input
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  type="number"
                  value={draftStockQty}
                  onChange={(e) => setDraftStockQty(Number(e.target.value))}
                  disabled={busy}
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => setEditStockQty(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  disabled={busy}
                  onClick={() =>
                    run(() => {
                      const qty = toInt32("stock_quantity", draftStockQty, { min: 0, allowZero: true });
                      return updateVariantStockQty(productId, variant.variant_id, qty);
                    })
                  }
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Weight */}
        <div className="mt-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">Weight (grams)</p>
            {!editWeight ? (
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => setEditWeight(true)}
                disabled={busy}
              >
                Update
              </button>
            ) : null}
          </div>

          {!editWeight ? (
            <p className="mt-2 text-sm text-gray-700">
              Current: <span className="font-semibold">{variant.weight_grams ?? 0}</span> g
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600">New weight (1 to int32 max)</p>
                <input
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  type="number"
                  value={draftWeight}
                  onChange={(e) => setDraftWeight(Number(e.target.value))}
                  disabled={busy}
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => setEditWeight(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  disabled={busy}
                  onClick={() =>
                    run(() => {
                      const w = toInt32("weight_grams", draftWeight, { min: 1, allowZero: false });
                      return updateVariantWeight(productId, variant.variant_id, w);
                    })
                  }
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Retail */}
      <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
        <p className="text-sm font-semibold text-gray-900">Retail</p>

        {/* Retail price */}
        <div className="mt-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-900">Retail price</p>
            {!editRetailPrice ? (
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => setEditRetailPrice(true)}
                disabled={busy}
              >
                Update
              </button>
            ) : null}
          </div>

          {!editRetailPrice ? (
            <p className="mt-2 text-sm text-gray-700">
              Current: <span className="font-semibold">{variant.retail_price}</span>
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-600">New retail price (&gt; 0)</p>
                <input
                  className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                  type="number"
                  value={draftRetailPrice}
                  onChange={(e) => setDraftRetailPrice(Number(e.target.value))}
                  disabled={busy}
                />
              </div>

              <div className="flex gap-2">
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => setEditRetailPrice(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  disabled={busy}
                  onClick={() =>
                    run(() => {
                      const p = toInt32("retail_price", draftRetailPrice, { min: 1, allowZero: false });
                      return updateVariantRetailPrice(productId, variant.variant_id, p);
                    })
                  }
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Retail discount */}
        <div className="mt-4 rounded-2xl border bg-white p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-gray-900">Retail discount</p>

            {!retailHasDiscount ? (
              !showAddRetailDiscount ? (
                <button
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  onClick={() => setShowAddRetailDiscount(true)}
                  disabled={busy}
                >
                  Add retail discount
                </button>
              ) : null
            ) : (
              <div className="flex flex-wrap gap-2">
                {!showEditRetailDiscount ? (
                  <button
                    className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                    onClick={() => setShowEditRetailDiscount(true)}
                    disabled={busy}
                  >
                    Update
                  </button>
                ) : null}
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                  onClick={() => run(() => removeRetailDiscount(productId, variant.variant_id))}
                  disabled={busy}
                >
                  Disable
                </button>
              </div>
            )}
          </div>

          {!retailHasDiscount ? (
            !showAddRetailDiscount ? (
              <p className="mt-2 text-sm text-gray-600">No retail discount set.</p>
            ) : (
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-600">Discount amount (&gt; 0)</p>
                  <input
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    type="number"
                    value={draftRetailDiscount}
                    onChange={(e) => setDraftRetailDiscount(Number(e.target.value))}
                    disabled={busy}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Discount type</p>
                  <select
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    value={draftRetailDiscountType}
                    onChange={(e) => setDraftRetailDiscountType(e.target.value as any)}
                    disabled={busy}
                  >
                    <option value="flat">flat</option>
                    <option value="percentage">percentage</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                  <button
                    className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                    onClick={() => setShowAddRetailDiscount(false)}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    disabled={busy || draftRetailDiscount <= 0}
                    onClick={() =>
                      run(() =>
                        addRetailDiscount(productId, variant.variant_id, {
                          retail_discount: toInt32("retail_discount", draftRetailDiscount, { min: 1, allowZero: false }),
                          retail_discount_type: draftRetailDiscountType,
                        })
                      )
                    }
                  >
                    Add
                  </button>
                </div>
              </div>
            )
          ) : (
            <>
              <p className="mt-2 text-sm text-gray-700">
                Current: <span className="font-semibold">{variant.retail_discount}</span> ({String(variant.retail_discount_type)})
              </p>

              {showEditRetailDiscount ? (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-gray-600">Discount amount</p>
                    <input
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      type="number"
                      value={draftRetailDiscount}
                      onChange={(e) => setDraftRetailDiscount(Number(e.target.value))}
                      disabled={busy}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600">Discount type</p>
                    <select
                      className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                      value={draftRetailDiscountType}
                      onChange={(e) => setDraftRetailDiscountType(e.target.value as any)}
                      disabled={busy}
                    >
                      <option value="flat">flat</option>
                      <option value="percentage">percentage</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                    <button
                      className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                      onClick={() => setShowEditRetailDiscount(false)}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      disabled={busy}
                      onClick={() =>
                        run(() =>
                          updateRetailDiscount(productId, variant.variant_id, {
                            retail_discount: toInt32("retail_discount", draftRetailDiscount, { min: 1, allowZero: false }),
                            retail_discount_type: draftRetailDiscountType,
                          })
                        )
                      }
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Wholesale */}
      <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Wholesale</p>
            <p className="mt-1 text-sm text-gray-600">
              {wholesaleEnabled ? "Wholesale mode is enabled." : "Wholesale mode is disabled."}
            </p>
          </div>

          {!wholesaleEnabled ? (
            !showEnableWholesale ? (
              <button
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                onClick={() => setShowEnableWholesale(true)}
                disabled={busy}
              >
                Enable wholesale mode
              </button>
            ) : null
          ) : (
            <button
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
              onClick={() => run(() => disableWholesaleMode(productId, variant.variant_id))}
              disabled={busy}
            >
              Disable wholesale mode
            </button>
          )}
        </div>

        {/* Enable wholesale flow */}
        {!wholesaleEnabled ? (
          showEnableWholesale ? (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-600">Wholesale price (required)</p>
                  <input
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    type="number"
                    value={draftWholesalePrice}
                    onChange={(e) => setDraftWholesalePrice(Number(e.target.value))}
                    disabled={busy}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Min qty wholesale (required)</p>
                  <input
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    type="number"
                    value={draftWholesaleMinQty}
                    onChange={(e) => setDraftWholesaleMinQty(Number(e.target.value))}
                    disabled={busy}
                  />
                </div>
              </div>

              {!showEnableWholesaleDiscount ? (
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => setShowEnableWholesaleDiscount(true)}
                  disabled={busy}
                >
                  Add wholesale discount (optional)
                </button>
              ) : (
                <div className="rounded-2xl border bg-white p-4">
                  <p className="text-sm font-semibold text-gray-900">Wholesale discount (optional)</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Discount amount</p>
                      <input
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        type="number"
                        value={draftWholesaleDiscount}
                        onChange={(e) => setDraftWholesaleDiscount(Number(e.target.value))}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Discount type</p>
                      <select
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        value={draftWholesaleDiscountType}
                        onChange={(e) => setDraftWholesaleDiscountType(e.target.value as any)}
                        disabled={busy}
                      >
                        <option value="flat">flat</option>
                        <option value="percentage">percentage</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => setShowEnableWholesale(false)}
                  disabled={busy}
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  disabled={busy}
                  onClick={() =>
                    run(() => {
                      const wp = toInt32("wholesale_price", draftWholesalePrice, { min: 1, allowZero: false });
                      const mq = toInt32("min_qty_wholesale", draftWholesaleMinQty, { min: 1, allowZero: false });

                      const payload: any = { wholesale_price: wp, min_qty_wholesale: mq };

                      if (showEnableWholesaleDiscount && draftWholesaleDiscount > 0) {
                        payload.wholesale_discount = toInt32("wholesale_discount", draftWholesaleDiscount, { min: 1, allowZero: false });
                        payload.wholesale_discount_type = draftWholesaleDiscountType;
                      }

                      return enableWholesaleMode(productId, variant.variant_id, payload);
                    })
                  }
                >
                  Enable
                </button>
              </div>
            </div>
          ) : null
        ) : (
          // Wholesale enabled view
          <div className="mt-3 rounded-2xl border bg-white p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700">
                <p>
                  Wholesale price: <span className="font-semibold">{wholesalePriceCurrent}</span>
                </p>
                <p className="mt-1">
                  Min qty: <span className="font-semibold">{minQtyWholesaleCurrent}</span>
                </p>
              </div>

              {!showEditWholesaleInfo ? (
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => setShowEditWholesaleInfo(true)}
                  disabled={busy}
                >
                  Update wholesale info
                </button>
              ) : null}
            </div>

            {showEditWholesaleInfo ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium text-gray-600">Wholesale price</p>
                  <input
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    type="number"
                    value={draftWholesalePrice}
                    onChange={(e) => setDraftWholesalePrice(Number(e.target.value))}
                    disabled={busy}
                  />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600">Min qty wholesale</p>
                  <input
                    className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                    type="number"
                    value={draftWholesaleMinQty}
                    onChange={(e) => setDraftWholesaleMinQty(Number(e.target.value))}
                    disabled={busy}
                  />
                </div>

                <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                  <button
                    className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                    onClick={() => setShowEditWholesaleInfo(false)}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                    disabled={busy}
                    onClick={() =>
                      run(() => {
                        const payload: any = {};
                        if (draftWholesalePrice !== wholesalePriceCurrent) {
                          payload.wholesale_price = toInt32("wholesale_price", draftWholesalePrice, { min: 1, allowZero: false });
                        }
                        if (draftWholesaleMinQty !== minQtyWholesaleCurrent) {
                          payload.min_qty_wholesale = toInt32("min_qty_wholesale", draftWholesaleMinQty, { min: 1, allowZero: false });
                        }
                        return updateWholesaleMode(productId, variant.variant_id, payload);
                      })
                    }
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : null}

            {/* Wholesale discount block */}
            <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Wholesale discount</p>
                  {wholesaleHasDiscount ? (
                    <p className="mt-1 text-sm text-gray-700">
                      Current: <span className="font-semibold">{wholesaleDiscountCurrent}</span> ({wholesaleDiscountTypeCurrent})
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-600">No wholesale discount set.</p>
                  )}
                </div>

                {!wholesaleHasDiscount ? (
                  !showAddWholesaleDiscount ? (
                    <button
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                      onClick={() => setShowAddWholesaleDiscount(true)}
                      disabled={busy}
                    >
                      Add discount
                    </button>
                  ) : null
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {!showEditWholesaleDiscount ? (
                      <button
                        className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                        onClick={() => setShowEditWholesaleDiscount(true)}
                        disabled={busy}
                      >
                        Update
                      </button>
                    ) : null}
                    <button
                      className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                      onClick={() => run(() => removeWholesaleDiscount(productId, variant.variant_id))}
                      disabled={busy}
                    >
                      Disable
                    </button>
                  </div>
                )}
              </div>

              {!wholesaleHasDiscount ? (
                showAddWholesaleDiscount ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Discount amount (&gt; 0)</p>
                      <input
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        type="number"
                        value={draftWholesaleDiscount}
                        onChange={(e) => setDraftWholesaleDiscount(Number(e.target.value))}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Discount type</p>
                      <select
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        value={draftWholesaleDiscountType}
                        onChange={(e) => setDraftWholesaleDiscountType(e.target.value as any)}
                        disabled={busy}
                      >
                        <option value="flat">flat</option>
                        <option value="percentage">percentage</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                        onClick={() => setShowAddWholesaleDiscount(false)}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        disabled={busy || draftWholesaleDiscount <= 0}
                        onClick={() =>
                          run(() =>
                            addWholesaleDiscount(productId, variant.variant_id, {
                              wholesale_discount: toInt32("wholesale_discount", draftWholesaleDiscount, { min: 1, allowZero: false }),
                              wholesale_discount_type: draftWholesaleDiscountType,
                            })
                          )
                        }
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ) : null
              ) : (
                showEditWholesaleDiscount ? (
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Discount amount</p>
                      <input
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        type="number"
                        value={draftWholesaleDiscount}
                        onChange={(e) => setDraftWholesaleDiscount(Number(e.target.value))}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Discount type</p>
                      <select
                        className="mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm"
                        value={draftWholesaleDiscountType}
                        onChange={(e) => setDraftWholesaleDiscountType(e.target.value as any)}
                        disabled={busy}
                      >
                        <option value="flat">flat</option>
                        <option value="percentage">percentage</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex flex-wrap justify-end gap-2">
                      <button
                        className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                        onClick={() => setShowEditWholesaleDiscount(false)}
                        disabled={busy}
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                        disabled={busy}
                        onClick={() =>
                          run(() =>
                            updateWholesaleDiscount(productId, variant.variant_id, {
                              wholesale_discount: toInt32("wholesale_discount", draftWholesaleDiscount, { min: 1, allowZero: false }),
                              wholesale_discount_type: draftWholesaleDiscountType,
                            })
                          )
                        }
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </div>
        )}
      </div>

      {/* Archive confirm */}
      <ConfirmModal
        open={openArchive}
        title="Archive this variant?"
        description="This will remove it from active selling. You can potentially recover it later."
        confirmText="Yes, archive"
        danger
        loading={busy}
        onConfirm={() => run(() => archiveVariant(productId, variant.variant_id))}
        onClose={() => setOpenArchive(false)}
      />
    </div>
  );
}