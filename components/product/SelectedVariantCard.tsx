"use client";

import type { Variant } from "@/components/catalog/VariantSelector";
import { money } from "@/components/product/utils";

export default function SelectedVariantCard({
  selectedVariant,
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
  selectedVariant: Variant;

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
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[rgb(var(--text))]">Selected variant</div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            <span className="font-semibold text-[rgb(var(--text))]">{selectedVariant.color}</span>{" "}
            /{" "}
            <span className="font-semibold text-[rgb(var(--text))]">{selectedVariant.size}</span>
            {selectedVariant.in_stock === false ? (
              <span className="ml-2 inline-flex rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
                Out of stock
              </span>
            ) : null}
          </div>
        </div>

        <div className="inline-flex items-center rounded-2xl border border-black/10 bg-[rgb(var(--surface))] p-1">
          <button
            className="h-9 w-9 rounded-xl text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={submitting}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <div className="w-10 text-center text-sm font-semibold text-[rgb(var(--text))]">{qty}</div>
          <button
            className="h-9 w-9 rounded-xl text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
            onClick={() => setQty((q) => q + 1)}
            disabled={submitting}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <div className="flex items-baseline justify-between gap-4">
            <div className="text-sm font-semibold text-[rgb(var(--text))]">Retail price</div>
            <div className="text-right">
              <div className="font-display text-xl font-semibold text-[rgb(var(--text))]">
                {money(retailNow)}
              </div>

              {showRetailDiscount ? (
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  <span className="line-through mr-2">{money(retailBase)}</span>
                  <span>
                    {selectedVariant.retail_discount_type === "percentage"
                      ? `${selectedVariant.retail_discount}% off`
                      : `${money(Number(selectedVariant.retail_discount ?? 0))} off`}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-2 text-xs text-[rgb(var(--muted))]">
            Subtotal:{" "}
            <span className="font-semibold text-[rgb(var(--text))]">{money(retailSubtotal)}</span>
          </div>
        </div>

        {showWholesale ? (
          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-[rgb(var(--text))]">Wholesale</div>
                <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                  {wholesaleMin ? `Minimum quantity: ${wholesaleMin}` : "Minimum quantity may apply."}
                </div>
              </div>

              <div className="text-right">
                <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                  {money(wholesaleNow)}
                </div>

                {showWholesaleDiscount ? (
                  <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                    <span className="line-through mr-2">{money(wholesaleBase)}</span>
                    <span>
                      {selectedVariant.wholesale_discount_type === "percentage"
                        ? `${selectedVariant.wholesale_discount}% off`
                        : `${money(Number(selectedVariant.wholesale_discount ?? 0))} off`}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {inCart ? (
          <div className="text-xs text-[rgb(var(--muted))]">
            Already in cart — this will update quantity.
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex gap-3">
        <button
          onClick={onAddOrUpdate}
          disabled={!canSubmit || submitting}
          className="flex-1 rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
        >
          {submitting ? "Working…" : inCart ? "Update cart" : "Add to cart"}
        </button>

        <button
          onClick={onBuyNow}
          disabled={!canSubmit || submitting}
          className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
        >
          Buy now
        </button>
      </div>

      {!userExists ? (
        <div className="mt-3 text-xs text-[rgb(var(--muted))]">
          Login required to add/update cart.
        </div>
      ) : null}
    </div>
  );
}
