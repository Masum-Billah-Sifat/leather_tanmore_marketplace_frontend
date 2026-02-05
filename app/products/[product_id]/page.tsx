"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/utils/axios";
import VariantSelector, { Variant } from "@/components/catalog/VariantSelector";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";

type ProductDetail = {
  product_id: string;
  title: string;
  description?: string | null;
  category_name?: string;
  seller_store_name?: string;
  images: string[];
  promo_video_url?: string | null;
  variants: Variant[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const product_id = params?.product_id as string;

  const { user } = useAuthStore();
  const cart = useCartStore();

  const [loading, setLoading] = useState(false);
  const [p, setP] = useState<ProductDetail | null>(null);
  const [imgIdx, setImgIdx] = useState(0);

  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user && !cart.hydrated && !cart.loading) {
      cart.fetchCart().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/products/${product_id}`);
        const payload = res.data?.data ?? res.data;
        setP(payload as ProductDetail);
        setImgIdx(0);
      } catch (e) {
        handleApiError(e);
      } finally {
        setLoading(false);
      }
    };
    if (product_id) run();
  }, [product_id]);

  const inCart = selectedVariant ? cart.isInCart(selectedVariant.variant_id) : false;

  useEffect(() => {
    if (!selectedVariant) return;
    const existing = cart.getQty(selectedVariant.variant_id);
    setQty(existing > 0 ? existing : 1);
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

  const canSubmit = !!user && !!p && !!selectedVariant && qty >= 1;

  const onAddOrUpdate = async () => {
    if (!user) {
      alert("Please login first.");
      return;
    }
    if (!p || !selectedVariant) return;

    setSubmitting(true);
    try {
      if (inCart) {
        await cart.updateQty({ variant_id: selectedVariant.variant_id, qty });
      } else {
        await cart.addToCart({ product_id: p.product_id, variant_id: selectedVariant.variant_id, qty });
      }
    } catch (e) {
      handleApiError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const onBuyNow = async () => {
    await onAddOrUpdate();
    router.push("/cart");
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-sm text-gray-500">Loading product…</div>
      </main>
    );
  }

  if (!p) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="text-sm text-gray-500">No product loaded.</div>
      </main>
    );
  }

  const images = p.images ?? [];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <button onClick={() => router.back()} className="text-sm text-gray-600 hover:underline">
        ← Back
      </button>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border bg-white overflow-hidden">
          <div className="aspect-[4/3] bg-gray-100">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={images[imgIdx]} alt={p.title} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                No image
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <div className="flex items-center justify-between p-3 border-t">
              <button
                className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
                onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                disabled={imgIdx === 0}
              >
                ← Prev
              </button>
              <div className="text-xs text-gray-500">
                {imgIdx + 1} / {images.length}
              </div>
              <button
                className="rounded-xl border px-3 py-2 text-sm disabled:opacity-40"
                onClick={() => setImgIdx((i) => Math.min(images.length - 1, i + 1))}
                disabled={imgIdx === images.length - 1}
              >
                Next →
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{p.title}</h1>
            <div className="mt-1 text-sm text-gray-600">
              {p.seller_store_name ? `Sold by ${p.seller_store_name}` : null}
              {p.category_name ? ` • ${p.category_name}` : null}
            </div>
            {p.description ? (
              <p className="mt-3 text-sm text-gray-700">{p.description}</p>
            ) : null}
          </div>

          <div className="rounded-2xl border bg-white p-5 space-y-4">
            <VariantSelector variants={p.variants ?? []} onChange={setSelectedVariant} />

            {selectedVariant ? (
              <div className="rounded-xl border bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Price: <span className="font-medium">{priceText}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border px-3 py-1 text-sm"
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={submitting}
                    >
                      −
                    </button>
                    <div className="w-10 text-center text-sm font-medium">{qty}</div>
                    <button
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
                    Already in cart — this will update quantity.
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="flex gap-3">
              <button
                onClick={onAddOrUpdate}
                disabled={!canSubmit || submitting}
                className="flex-1 rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                {submitting ? "Working…" : inCart ? "Update cart" : "Add to cart"}
              </button>
              <button
                onClick={onBuyNow}
                disabled={!canSubmit || submitting}
                className="flex-1 rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:text-gray-400 disabled:border-gray-200"
              >
                Buy now
              </button>
            </div>

            {!user ? (
              <div className="text-xs text-gray-500">
                Login required to add/update cart.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
