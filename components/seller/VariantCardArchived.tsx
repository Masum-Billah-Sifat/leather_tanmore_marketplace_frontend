"use client";

import { useState } from "react";
import type { SellerVariant } from "@/types/sellerProducts";
import { recoverVariant } from "@/api/sellerProductApi";
import { handleApiError } from "@/utils/handleApiError";

export default function VariantCardArchived({
  productId,
  variant,
  onUpdated,
}: {
  productId: string;
  variant: SellerVariant;
  onUpdated: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);

  async function recover() {
    setBusy(true);
    try {
      // NOTE: endpoint not provided. sellerProductApi.ts has a stub route; adjust there.
      await recoverVariant(productId, variant.variant_id);
      await onUpdated();
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-gray-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">
            {variant.color} / {variant.size}
          </p>
          <p className="mt-1 text-xs text-gray-500 truncate">Variant ID: {variant.variant_id}</p>
        </div>

        <button
          className="rounded-xl bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
          onClick={recover}
          disabled={busy}
        >
          {busy ? "Working..." : "Recover"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-700">
        <div>Retail: {variant.retail_price}</div>
        <div>Weight: {variant.weight_grams}g</div>
        <div>In stock: {String(variant.is_in_stock)}</div>
        <div>Qty: {variant.stock_quantity}</div>
        <div className="col-span-2">
          Retail discount: {variant.has_retail_discount ? `${variant.retail_discount} (${variant.retail_discount_type})` : "—"}
        </div>
        <div className="col-span-2">
          Wholesale: {variant.has_wholesale_enabled ? "Enabled" : "Disabled"}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Archived variants are read-only. Recover to edit again.
      </p>
    </div>
  );
}