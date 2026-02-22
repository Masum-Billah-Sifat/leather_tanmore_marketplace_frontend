// app/seller/dashboard/page.tsx
"use client";

import Link from "next/link";
import { useSellerProducts } from "@/hooks/useSellerProducts";
import SellerProductGrid from "@/components/seller/SellerProductGrid";
import SellerProductGridSkeleton from "@/components/seller/SellerProductGridSkeleton";
import SellerProductsEmpty from "@/components/seller/SellerProductsEmpty";

export default function SellerDashboardPage() {
  const { payload, validProducts, loading, error } = useSellerProducts();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {payload?.seller_store_name ? (
              <>
                Store:{" "}
                <span className="font-medium text-gray-900">
                  {payload.seller_store_name}
                </span>
              </>
            ) : (
              "Manage your products."
            )}
          </p>
        </div>

        {/* DO NOT TOUCH: kept exactly same styling/behavior */}
        <Link
          href="/seller/products/create"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Create a Product
        </Link>
      </div>

      <div className="mt-6">
        {/* {loading ? (
          <SellerProductGridSkeleton count={6} />
        ) : validProducts.length === 0 ? (
          <SellerProductsEmpty />
        ) : (
          <SellerProductGrid products={validProducts} />
        )} */}

        {loading ? (
          <SellerProductGridSkeleton count={6} />
        ) : error ? (
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-900">
              Could not load products
            </p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
          </div>
        ) : validProducts.length === 0 ? (
          <SellerProductsEmpty />
        ) : (
          <SellerProductGrid products={validProducts} />
        )}
      </div>
    </main>
  );
}
