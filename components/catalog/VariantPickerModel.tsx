"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VariantSelector, { Variant } from "@/components/catalog/VariantSelector";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";

type ProductMini = {
  product_id: string;
  title: string;
  images: string[];
  variants: Variant[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  product: ProductMini | null;
  intent: "add" | "buy"; // which button opened it
};

export default function VariantPickerModal({ open, onClose, product, intent }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const cart = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedVariant(null);
      setQty(1);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const inCart = selectedVariant ? cart.isInCart(selectedVariant.variant_id) : false;

  useEffect(() => {
    if (!selectedVariant) return;
    const existing = cart.getQty(selectedVariant.variant_id);
    if (existing > 0) setQty(existing);
    else setQty(1);
  }, [selectedVariant, cart]);

  const priceText = useMemo(() => {
    if (!selectedVariant) return null;
    const p = selectedVariant.retail_price;

    if (selectedVariant.has_retail_discount && selectedVariant.retail_discount) {
      const d = selectedVariant.retail_discount;
      const t = selectedVariant.retail_discount_type;
      return `৳${p} (discount: ${d}${t === "percentage" ? "%" : ""})`;
    }
    return `৳${p}`;
  }, [selectedVariant]);

  const canSubmit = !!user && !!product && !!selectedVariant && qty >= 1;

  const primaryLabel = !user
    ? "Login required"
    : !selectedVariant
    ? "Select variant"
    : inCart
    ? "Update cart"
    : "Add to cart";

  const run = async (finalIntent: "add" | "buy") => {
    if (!user) {
      alert("Please login first.");
      return;
    }
    if (!product || !selectedVariant) return;
    if (qty < 1) return;

    setSubmitting(true);
    try {
      if (inCart) {
        await cart.updateQty({ variant_id: selectedVariant.variant_id, qty });
      } else {
        await cart.addToCart({
          product_id: product.product_id,
          variant_id: selectedVariant.variant_id,
          qty,
        });
      }

      onClose();

      if (finalIntent === "buy") {
        router.push("/cart");
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border">
          <div className="flex items-start justify-between px-6 py-4 border-b">
            <div>
              <div className="text-lg font-semibold text-gray-900">Select options</div>
              <div className="text-sm text-gray-600">{product.title}</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {!user ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                You need to login to add items to cart.
              </div>
            ) : null}

            <VariantSelector variants={product.variants} onChange={setSelectedVariant} />

            {selectedVariant ? (
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Price: <span className="font-medium">{priceText}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-1 text-sm"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={submitting}
                    >
                      −
                    </button>
                    <div className="w-10 text-center text-sm font-medium">{qty}</div>
                    <button
                      type="button"
                      className="rounded-lg border px-3 py-1 text-sm"
                      onClick={() => setQty((q) => q + 1)}
                      disabled={submitting}
                    >
                      +
                    </button>
                  </div>
                </div>

                {inCart ? (
                  <div className="mt-2 text-xs text-gray-600">
                    This variant is already in your cart. You will update its quantity.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              onClick={() => run("add")}
              disabled={!canSubmit || submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-black disabled:bg-gray-300"
            >
              {submitting ? "Working..." : primaryLabel}
            </button>

            <button
              onClick={() => run("buy")}
              disabled={!canSubmit || submitting}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:text-gray-400 disabled:border-gray-200"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
