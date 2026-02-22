"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSellerProductDetail } from "@/hooks/useSellerProductDetail";
import ProductArchiveButton from "@/components/seller/ProductArchiveButton";
import ProductInfoCard from "@/components/seller/ProductInfoCard";
import ProductImagesCard from "@/components/seller/ProductImagesCard";
import ProductVideoCard from "@/components/seller/ProductVideoCard";
import VariantsSection from "@/components/seller/VariantsSection";
import CategoryPickerCard from "@/components/seller/CategoryPickerCard";

export default function SellerProductDetailsClient({
  productId,
}: {
  productId: string;
}) {
  const router = useRouter();
  const { product, loading, error, refresh } =
    useSellerProductDetail(productId);

  const statusBadge = useMemo(() => {
    if (!product) return null;
    const ok = !!product.is_product_approved;
    const cls = ok
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
    return (
      <span
        className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
      >
        {ok ? "Approved" : "Pending"}
      </span>
    );
  }, [product]);

  if (loading) {
    return (
      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-600">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-900">
          Could not load product
        </p>
        <p className="mt-1 text-sm text-gray-600">{error || "Unknown error"}</p>
        <div className="mt-4 flex gap-2">
          <button
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            onClick={() => refresh()}
          >
            Retry
          </button>
          <button
            className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
            onClick={() => router.push("/seller/dashboard")}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-gray-900">
              {product.title}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {statusBadge}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <ProductArchiveButton productId={product.product_id} />
          </div>
        </div>
      </div>

      <ProductInfoCard product={product} onUpdated={refresh} />

      {/* <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ProductImagesCard product={product} onUpdated={refresh} />
        <ProductVideoCard product={product} onUpdated={refresh} />
      </div> */}

      <div className="space-y-5">
        <ProductImagesCard product={product} onUpdated={refresh} />
        <ProductVideoCard product={product} onUpdated={refresh} />
      </div>

      {/* Category UI needs your category list + update endpoint; we’ll add next once you paste those endpoints */}

      <CategoryPickerCard
        productId={product.product_id}
        currentCategoryId={product.category_id}
        currentCategoryName={product.category_name}
        onUpdated={refresh}
      />
      <VariantsSection product={product} onUpdated={refresh} />
    </div>
  );
}
