"use client";

import type { SellerProductDetail } from "@/types/sellerProductDetail";
import VariantCardEditable from "@/components/seller/VariantCardEditable";
import VariantCardArchived from "@/components/seller/VariantCardArchived";
import AddVariantCard from "@/components/seller/AddVariantCard";

export default function VariantsSection({
  product,
  onUpdated,
}: {
  product: SellerProductDetail;
  onUpdated: () => Promise<void>;
}) {
  const valid = product.valid_variants || [];
  const archived = product.archived_variants || [];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Variants</p>
        <p className="mt-1 text-sm text-gray-600">
          Edit only what you need. Each action calls one focused endpoint.
        </p>
      </div>

      <AddVariantCard productId={product.product_id} onUpdated={onUpdated} />

      {/* ✅ Always stacked */}
      <div className="space-y-3">
        {valid.map((v) => (
          <VariantCardEditable
            key={v.variant_id}
            productId={product.product_id}
            variant={v}
            onUpdated={onUpdated}
          />
        ))}
      </div>

      {archived.length ? (
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Archived variants</p>
          <p className="mt-1 text-sm text-gray-600">
            Read-only. Recover to edit again (if supported).
          </p>

          {/* ✅ Always stacked */}
          <div className="mt-4 space-y-3">
            {archived.map((v) => (
              <VariantCardArchived
                key={v.variant_id}
                productId={product.product_id}
                variant={v}
                onUpdated={onUpdated}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}