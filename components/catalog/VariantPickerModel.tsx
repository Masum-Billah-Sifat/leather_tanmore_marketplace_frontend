// components/catalog/VariantPickerModel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VariantSelector, { Variant } from "@/components/catalog/VariantSelector";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";
import { initiateCheckoutFromProduct } from "@/utils/checkout";

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
  intent: "add" | "buy";
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatMoney(v?: number | null) {
  if (v === null || v === undefined) return null;
  return `৳${v}`;
}

function calcDiscounted(
  price: number,
  disc: number,
  type: "flat" | "percentage",
) {
  if (type === "flat") return Math.max(0, price - disc);
  // percentage
  const off = (price * disc) / 100;
  return Math.max(0, Math.round(price - off));
}

export default function VariantPickerModal({
  open,
  onClose,
  product,
  intent,
}: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const cart = useCartStore();

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // const images = product?.images ?? [];

  const images = (
    product?.images && Array.isArray(product.images) ? product.images : []
  ) as string[];

  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (!open) {
      setSelectedVariant(null);
      setQty(1);
      setSubmitting(false);
      setImgIdx(0);
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

  const inCart = selectedVariant
    ? cart.isInCart(selectedVariant.variant_id)
    : false;

  useEffect(() => {
    if (!selectedVariant) return;
    const existing = cart.getQty(selectedVariant.variant_id);
    setQty(existing > 0 ? existing : 1);
  }, [selectedVariant, cart]);

  const canLeft = imgIdx > 0;
  const canRight = imgIdx < images.length - 1;

  const go = (delta: number) => {
    setImgIdx((i) => clamp(i + delta, 0, Math.max(0, images.length - 1)));
  };

  const retailBlock = useMemo(() => {
    if (!selectedVariant) return null;

    const p = selectedVariant.retail_price;
    const hasDisc =
      !!selectedVariant.has_retail_discount &&
      !!selectedVariant.retail_discount &&
      !!selectedVariant.retail_discount_type;

    if (!hasDisc) {
      return { label: "Retail", price: formatMoney(p), sub: null };
    }

    const d = selectedVariant.retail_discount!;
    const t = selectedVariant.retail_discount_type!;
    const discounted = calcDiscounted(p, d, t);

    return {
      label: "Retail",
      price: formatMoney(discounted),
      sub: `Was ${formatMoney(p)} • Discount ${d}${t === "percentage" ? "%" : ""}`,
    };
  }, [selectedVariant]);

  const wholesaleBlock = useMemo(() => {
    if (!selectedVariant) return null;

    // allow both naming styles (backend might send wholesale_min_qty)
    const minQty =
      (selectedVariant as any).wholesale_min_quantity ??
      (selectedVariant as any).wholesale_min_qty ??
      null;

    const enabled =
      !!selectedVariant.wholesale_enabled && !!selectedVariant.wholesale_price;

    if (!enabled) return null;

    const wp = selectedVariant.wholesale_price!;
    const wd = (selectedVariant as any).wholesale_discount ?? null;
    const wdt = (selectedVariant as any).wholesale_discount_type ?? null;

    const hasWDisc = wd !== null && wd !== undefined && wdt;
    const discounted = hasWDisc ? calcDiscounted(wp, wd, wdt) : wp;

    return {
      label: "Wholesale",
      price: formatMoney(discounted),
      sub: [
        minQty ? `Min qty ${minQty}` : null,
        hasWDisc
          ? `Was ${formatMoney(wp)} • Discount ${wd}${wdt === "percentage" ? "%" : ""}`
          : null,
      ]
        .filter(Boolean)
        .join(" • "),
    };
  }, [selectedVariant]);

  const canSubmit = !!user && !!product && !!selectedVariant && qty >= 1;

  const primaryLabel = !user
    ? "Login required"
    : !selectedVariant
      ? "Select variant"
      : inCart
        ? "Update cart"
        : "Add to cart";

  const onAddOrUpdate = async () => {
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
    } catch (e) {
      handleApiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onBuyNow = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }
    if (!selectedVariant) return;
    if (qty < 1) return;

    setSubmitting(true);
    try {
      const sessionId = await initiateCheckoutFromProduct({
        variant_id: selectedVariant.variant_id,
        quantity: qty,
      });

      onClose();
      router.push(`/checkout?session_id=${encodeURIComponent(sessionId)}`);
    } catch (e) {
      handleApiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          // className="w-full max-w-6xl rounded-2xl bg-[rgb(var(--surface))] shadow-xl border border-black/10 overflow-hidden"
          className={[
            "rounded-2xl bg-[rgb(var(--surface))] shadow-xl border border-black/10 overflow-hidden",
            // ✅ size: 80% on mobile, 70% on small tablets, 50% on large screens
            "w-[90vw] sm:w-[80vw] lg:w-[60vw]",
            // ✅ height: make it feel like a modal (not full screen)
            "h-[90vh] sm:h-[80vh] lg:h-[75vh]",
            // ✅ keep it reasonable on ultra-wide screens
            "max-w-[920px]",
            // ✅ and not too tiny
            "min-w-[320px]",
            // ✅ internal scrolling instead of growing beyond viewport
            "flex flex-col",
          ].join(" ")}
        >
          <div className="flex items-start justify-between px-6 py-4 border-b border-black/5 bg-black/[0.02]">
            <div className="min-w-0">
              <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                {intent === "buy" ? "Buy now" : "Select options"}
              </div>
              <div className="text-sm text-[rgb(var(--muted))] truncate">
                {product.title}
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-[rgb(var(--muted))] hover:bg-black/5"
              aria-label="Close"
              disabled={submitting}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* LEFT: large image */}
              <div className="p-6 border-b lg:border-b-0 lg:border-r border-black/5">
                <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-black/5">
                  <div className="relative aspect-[4/3]">
                    {images.length ? (
                      <Image
                        src={images[imgIdx]}
                        alt={`${product.title} image ${imgIdx + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority={false}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-sm text-[rgb(var(--muted))]">
                        No image
                      </div>
                    )}
                  </div>

                  {images.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => canLeft && go(-1)}
                        disabled={!canLeft}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-[rgb(var(--surface))]/90 px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Previous image"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={() => canRight && go(1)}
                        disabled={!canRight}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-[rgb(var(--surface))]/90 px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Next image"
                      >
                        →
                      </button>
                    </>
                  ) : null}
                </div>

                {images.length > 1 ? (
                  <div className="mt-4 flex gap-2 overflow-x-auto no-scrollbar">
                    {images.map((src, idx) => {
                      const active = idx === imgIdx;
                      return (
                        <button
                          key={`modal-thumb-${idx}`}
                          type="button"
                          onClick={() => setImgIdx(idx)}
                          className={[
                            "relative h-14 w-14 flex-none overflow-hidden rounded-xl border",
                            active
                              ? "border-[rgb(var(--brand))]/50"
                              : "border-black/10",
                          ].join(" ")}
                          aria-label={`Select image ${idx + 1}`}
                        >
                          <Image
                            src={src}
                            alt={`thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                          {active ? (
                            <div className="absolute inset-0 ring-2 ring-[rgb(var(--brand))]/30" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {/* RIGHT: selectors + pricing */}
              <div className="p-6 space-y-5">
                {!user ? (
                  <div className="rounded-2xl border border-[rgb(var(--brand))]/25 bg-[rgb(var(--brand))]/10 p-4 text-sm text-[rgb(var(--brand-strong))]">
                    You need to login to add items to cart / buy now.
                  </div>
                ) : null}

                <VariantSelector
                  variants={product.variants}
                  onChange={setSelectedVariant}
                />

                {selectedVariant ? (
                  <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        {retailBlock ? (
                          <div>
                            <div className="text-sm font-semibold text-[rgb(var(--text))]">
                              {retailBlock.label}:{" "}
                              <span className="font-display">
                                {retailBlock.price}
                              </span>
                            </div>
                            {retailBlock.sub ? (
                              <div className="text-xs text-[rgb(var(--muted))]">
                                {retailBlock.sub}
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {wholesaleBlock ? (
                          <div className="pt-2">
                            <div className="text-sm font-semibold text-[rgb(var(--text))]">
                              {wholesaleBlock.label}:{" "}
                              <span className="font-display">
                                {wholesaleBlock.price}
                              </span>
                            </div>
                            {wholesaleBlock.sub ? (
                              <div className="text-xs text-[rgb(var(--muted))]">
                                {wholesaleBlock.sub}
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {selectedVariant.in_stock !== undefined ||
                        selectedVariant.stock_quantity !== undefined ? (
                          <div className="pt-2 text-xs text-[rgb(var(--muted))]">
                            {selectedVariant.in_stock === false
                              ? "Out of stock"
                              : "In stock"}
                            {selectedVariant.stock_quantity !== undefined
                              ? ` • Qty ${selectedVariant.stock_quantity}`
                              : null}
                          </div>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-black/10 px-3 py-1 text-sm hover:bg-black/5"
                          onClick={() => setQty((q) => Math.max(1, q - 1))}
                          disabled={submitting}
                        >
                          −
                        </button>
                        <div className="w-10 text-center text-sm font-semibold text-[rgb(var(--text))]">
                          {qty}
                        </div>
                        <button
                          type="button"
                          className="rounded-lg border border-black/10 px-3 py-1 text-sm hover:bg-black/5"
                          onClick={() => setQty((q) => q + 1)}
                          disabled={submitting}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {inCart ? (
                      <div className="text-xs text-[rgb(var(--muted))]">
                        This variant is already in your cart. “Add to cart” will
                        update its quantity.
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-sm text-[rgb(var(--muted))]">
                    Select a variant to see price, discounts, and wholesale
                    availability.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-black/5 bg-black/[0.02]">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-[rgb(var(--muted))] hover:bg-black/5"
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              onClick={onAddOrUpdate}
              disabled={!canSubmit || submitting}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-[rgb(var(--brand))] disabled:bg-black/20"
            >
              {submitting ? "Working..." : primaryLabel}
            </button>

            <button
              onClick={onBuyNow}
              disabled={!canSubmit || submitting}
              className="rounded-xl border border-[rgb(var(--brand))]/30 px-4 py-2 text-sm font-medium text-[rgb(var(--brand-strong))] hover:bg-[rgb(var(--brand))]/10 disabled:opacity-50"
            >
              Buy now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
