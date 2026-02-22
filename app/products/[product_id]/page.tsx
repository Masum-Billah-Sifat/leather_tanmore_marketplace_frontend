"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/utils/axios";
import type { Variant } from "@/components/catalog/VariantSelector";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";

import type { ProductDetail } from "@/components/product/types";
import ProductMediaGallery from "@/components/product/ProductMediaGallery";
import ProductDetailsPanel from "@/components/product/ProductDetailsPanel";
import ProductTabs, { ProductTabKey } from "@/components/product/ProductTabs";
import { retailFinal, wholesaleFinal } from "@/components/product/utils";

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

  const [tab, setTab] = useState<ProductTabKey>("description");

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
        setSelectedVariant(null);
        setQty(1);
        setTab("description");
      } catch (e) {
        handleApiError(e);
      } finally {
        setLoading(false);
      }
    };

    if (product_id) run();
  }, [product_id]);

  const images = p?.images ?? [];

  const inCart = selectedVariant ? cart.isInCart(selectedVariant.variant_id) : false;

  useEffect(() => {
    if (!selectedVariant) return;
    const existing = cart.getQty(selectedVariant.variant_id);
    setQty(existing > 0 ? existing : 1);
  }, [selectedVariant, cart]);

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
        await cart.addToCart({
          product_id: p.product_id,
          variant_id: selectedVariant.variant_id,
          qty,
        });
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

  const retailBase = selectedVariant ? Number(selectedVariant.retail_price ?? 0) : 0;
  const retailNow = selectedVariant ? retailFinal(selectedVariant) : 0;

  const showRetailDiscount =
    !!selectedVariant?.has_retail_discount && !!selectedVariant?.retail_discount;

  const showWholesale =
    !!selectedVariant?.wholesale_enabled || !!selectedVariant?.wholesale_price;

  const wholesaleBase = selectedVariant ? Number(selectedVariant.wholesale_price ?? 0) : 0;
  const wholesaleNow = selectedVariant ? wholesaleFinal(selectedVariant) : 0;

  const wholesaleMin =
    Number(
      selectedVariant?.wholesale_min_quantity ??
        selectedVariant?.wholesale_min_qty ??
        0
    ) || 0;

  const showWholesaleDiscount =
    showWholesale &&
    !!selectedVariant?.wholesale_discount &&
    !!selectedVariant?.wholesale_discount_type;

  const retailSubtotal = useMemo(() => retailNow * qty, [retailNow, qty]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--muted))]">
          Loading product…
        </div>
      </main>
    );
  }

  if (!p) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--muted))]">
          No product loaded.
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-2">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--muted))] hover:text-[rgb(var(--text))]"
      >
        <span className="text-base">←</span> Back
      </button>

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ProductMediaGallery
          title={p.title}
          images={images}
          imgIdx={imgIdx}
          onSelectImage={setImgIdx}
        />

        <ProductDetailsPanel
          product={p}
          selectedVariant={selectedVariant}
          onChangeVariant={setSelectedVariant}
          qty={qty}
          setQty={setQty}
          submitting={submitting}
          inCart={inCart}
          canSubmit={canSubmit}
          userExists={!!user}
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
      </div>

      <ProductTabs
        tab={tab}
        onChangeTab={setTab}
        description={p.description}
        promoVideoUrl={p.promo_video_url}
      />
    </main>
  );
}
