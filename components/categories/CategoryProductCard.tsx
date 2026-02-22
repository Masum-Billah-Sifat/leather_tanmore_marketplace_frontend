"use client";

import type { CategoryProduct } from "./types";

function computePrice(p: CategoryProduct): string {
  if (!p.variants?.length) return "—";
  const prices = p.variants.map((v) => {
    const base = v.retail_price ?? 0;
    if (v.has_retail_discount && v.retail_discount_type === "flat") return Math.max(0, base - (v.retail_discount ?? 0));
    // if percentage comes later, backend might already precompute; keep simple for now
    return base;
  });
  const min = Math.min(...prices);
  return String(min);
}

export default function CategoryProductCard({ product }: { product: CategoryProduct }) {
  const img = product.image_urls?.[0] ?? "";
  const price = computePrice(product);

  return (
    <div className="rounded-2xl border bg-white overflow-hidden">
      {img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={img} alt={product.title} className="h-44 w-full object-cover border-b" />
      ) : (
        <div className="h-44 w-full bg-gray-100 border-b" />
      )}

      <div className="p-4">
        <div className="text-sm text-gray-600">{product.seller_store_name}</div>
        <div className="mt-1 text-base font-semibold text-gray-900 line-clamp-2">
          {product.title}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-600">{product.category_name}</div>
          <div className="text-sm font-semibold text-gray-900">৳{price}</div>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Variants: {product.variants?.length ?? 0}
        </div>
      </div>
    </div>
  );
}
