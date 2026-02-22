// components/cart/CartVariantRow.tsx
"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";

function money(n: number) {
  return `৳${Math.max(0, Math.round(Number(n) || 0))}`;
}

export default function CartVariantRow({
  productId,
  v,
}: {
  productId: string;
  v: any;
}) {
  const cart = useCartStore();
  const [qty, setQty] = useState<number>(v.quantity_in_cart ?? 1);
  const [busy, setBusy] = useState(false);

  const selected = !!cart.selected[v.variant_id];

  const retailBase = Number(v.retail_price ?? 0);

  const showRetailDiscount = !!v?.has_retail_discount && v?.retail_discount != null;
  const retailDiscType = String(v?.retail_discount_type ?? "flat");
  const retailDiscValue = Number(v?.retail_discount ?? 0);

  const showWholesale =
    !!v?.has_wholesale_enabled || v?.wholesale_price != null || v?.wholesale_min_qty != null;

  const wholesalePrice = Number(v?.wholesale_price ?? 0);
  const wholesaleMin = Number(v?.wholesale_min_qty ?? 0);

  const showWholesaleDiscount = !!v?.has_wholesale_discount && v?.wholesale_discount != null;
  const wholesaleDiscType = String(v?.wholesale_discount_type ?? "flat");
  const wholesaleDiscValue = Number(v?.wholesale_discount ?? 0);

  const onUpdate = async () => {
    if (qty < 1) return;
    setBusy(true);
    try {
      await cart.updateQty({ variant_id: v.variant_id, qty });
      await cart.refreshSummary();
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  const onRemove = async () => {
    setBusy(true);
    try {
      await cart.removeItem(v.variant_id);
      await cart.refreshSummary();
    } catch (e) {
      handleApiError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="py-4 border-t border-black/10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left */}
        <div className="flex items-start gap-3">
          <label className="mt-1 inline-flex items-center">
            <input
              type="checkbox"
              checked={selected}
              onChange={() => cart.toggleSelect(v.variant_id)}
              className="h-4 w-4 rounded border-black/20 text-[rgb(var(--brand-strong))] focus:ring-[rgb(var(--brand))]/40"
            />
          </label>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="text-sm font-semibold text-[rgb(var(--text))]">
                {v.color} / {v.size}
              </div>

              {showRetailDiscount ? (
                <span className="inline-flex rounded-full border border-black/10 bg-[rgb(var(--brand))]/10 px-2.5 py-1 text-xs font-semibold text-[rgb(var(--brand-strong))]">
                  Retail discount
                </span>
              ) : null}

              {showWholesale ? (
                <span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--text))]">
                  Wholesale available
                </span>
              ) : null}
            </div>

            {/* Retail (display only) */}
            <div className="mt-2 text-sm text-[rgb(var(--text))]">
              <span className="font-semibold">Retail:</span>{" "}
              <span className="font-semibold">{money(retailBase)}</span>

              {showRetailDiscount ? (
                <span className="ml-2 text-xs text-[rgb(var(--muted))]">
                  • {retailDiscType === "percentage"
                    ? `${retailDiscValue}% off`
                    : `${money(retailDiscValue)} off`}
                </span>
              ) : null}
            </div>

            {/* Wholesale (display only) */}
            {showWholesale ? (
              <div className="mt-2 rounded-2xl border border-black/10 bg-black/[0.02] px-3 py-2">
                <div className="text-xs text-[rgb(var(--muted))]">
                  <span className="font-semibold text-[rgb(var(--text))]">Wholesale:</span>{" "}
                  <span className="font-semibold text-[rgb(var(--text))]">
                    {money(wholesalePrice)}
                  </span>

                  {wholesaleMin ? (
                    <span className="ml-2">• min {wholesaleMin}</span>
                  ) : null}

                  {showWholesaleDiscount ? (
                    <span className="ml-2">
                      • discount{" "}
                      {wholesaleDiscType === "percentage"
                        ? `${wholesaleDiscValue}%`
                        : money(wholesaleDiscValue)}
                    </span>
                  ) : null}

                  {/* Optional hint (still not computing price) */}
                  {wholesaleMin ? (
                    <div className="mt-1 text-[10px]">
                      Wholesale applies only if quantity ≥ {wholesaleMin}.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {/* qty stepper */}
          <div className="inline-flex items-center rounded-2xl border border-black/10 bg-white p-1">
            <button
              className="h-9 w-9 rounded-xl text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={busy}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <div className="w-10 text-center text-sm font-semibold text-[rgb(var(--text))]">
              {qty}
            </div>
            <button
              className="h-9 w-9 rounded-xl text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
              onClick={() => setQty((q) => q + 1)}
              disabled={busy}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* actions */}
          <div className="flex items-center gap-2">
            <button
              className="rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
              onClick={onUpdate}
              disabled={busy}
            >
              {busy ? "Working…" : "Update"}
            </button>

            <button
              className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
              onClick={onRemove}
              disabled={busy}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
