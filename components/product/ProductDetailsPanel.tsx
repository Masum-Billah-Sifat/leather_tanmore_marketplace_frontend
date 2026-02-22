"use client";

import VariantSelector, { Variant } from "@/components/catalog/VariantSelector";
import type { ProductDetail } from "@/components/product/types";
import SelectedVariantCard from "@/components/product/SelectedVariantCard";

export default function ProductDetailsPanel({
  product,
  selectedVariant,
  onChangeVariant,

  qty,
  setQty,
  submitting,

  inCart,
  canSubmit,
  userExists,

  retailBase,
  retailNow,
  retailSubtotal,
  showRetailDiscount,

  showWholesale,
  wholesaleBase,
  wholesaleNow,
  wholesaleMin,
  showWholesaleDiscount,

  onAddOrUpdate,
  onBuyNow,
}: {
  product: ProductDetail;

  selectedVariant: Variant | null;
  onChangeVariant: (v: Variant | null) => void;

  qty: number;
  setQty: (next: number | ((prev: number) => number)) => void;
  submitting: boolean;

  inCart: boolean;
  canSubmit: boolean;
  userExists: boolean;

  retailBase: number;
  retailNow: number;
  retailSubtotal: number;
  showRetailDiscount: boolean;

  showWholesale: boolean;
  wholesaleBase: number;
  wholesaleNow: number;
  wholesaleMin: number;
  showWholesaleDiscount: boolean;

  onAddOrUpdate: () => Promise<void>;
  onBuyNow: () => Promise<void>;
}) {
  return (
    <section className="space-y-5">
      <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
        <div className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
          {product.title}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[rgb(var(--muted))]">
          {product.seller_store_name ? (
            <span className="inline-flex items-center gap-2">
              Sold by{" "}
              <span className="font-semibold text-[rgb(var(--text))]">
                {product.seller_store_name}
              </span>
            </span>
          ) : null}

          {product.category_name ? (
            <span className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold">
              {product.category_name}
            </span>
          ) : null}
        </div>

        <div className="mt-6">
          <VariantSelector variants={product.variants ?? []} onChange={onChangeVariant} />
        </div>

        <div className="mt-5">
          {selectedVariant ? (
            <SelectedVariantCard
              selectedVariant={selectedVariant}
              qty={qty}
              setQty={setQty}
              submitting={submitting}
              inCart={inCart}
              canSubmit={canSubmit}
              userExists={userExists}
              retailBase={retailBase}
              retailNow={retailNow}
              retailSubtotal={retailSubtotal}
              showRetailDiscount={showRetailDiscount}
              showWholesale={showWholesale}
              wholesaleBase={wholesaleBase}
              wholesaleNow={wholesaleNow}
              wholesaleMin={wholesaleMin}
              showWholesaleDiscount={showWholesaleDiscount}
              onAddOrUpdate={onAddOrUpdate}
              onBuyNow={onBuyNow}
            />
          ) : (
            <div className="rounded-3xl border border-black/10 bg-white p-5 text-sm text-[rgb(var(--muted))]">
              Pick a color and size to see price and availability.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
