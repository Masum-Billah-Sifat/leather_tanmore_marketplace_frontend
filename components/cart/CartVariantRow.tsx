"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";

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
    <div className="flex items-start justify-between gap-4 py-3 border-t">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => cart.toggleSelect(v.variant_id)}
          className="mt-1"
        />

        <div>
          <div className="text-sm font-medium text-gray-900">
            {v.color} / {v.size}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            Variant: {v.variant_id.slice(0, 8)}… • Weight: {v.weight_grams}g
          </div>
          <div className="mt-1 text-sm text-gray-800">
            ৳{v.retail_price}
            {v.has_retail_discount ? (
              <span className="text-xs text-gray-500">
                {" "}
                (discount: {v.retail_discount}
                {v.retail_discount_type === "percentage" ? "%" : ""})
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          disabled={busy}
        >
          −
        </button>
        <div className="w-10 text-center text-sm font-medium">{qty}</div>
        <button
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-40"
          onClick={() => setQty((q) => q + 1)}
          disabled={busy}
        >
          +
        </button>

        <button
          className="rounded-xl bg-black px-3 py-2 text-sm font-medium text-white disabled:bg-gray-300"
          onClick={onUpdate}
          disabled={busy}
        >
          Update
        </button>

        <button
          className="rounded-xl border px-3 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
          onClick={onRemove}
          disabled={busy}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
