// src/components/seller/SellerProductsEmpty.tsx
import Link from "next/link";

export default function SellerProductsEmpty() {
  return (
    <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
      <p className="text-sm font-medium text-gray-900">No products yet</p>
      <p className="mt-1 text-sm text-gray-600">
        Create your first product to start selling.
      </p>
      <Link
        href="/seller/products/create"
        className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
      >
        Create a Product
      </Link>
    </div>
  );
}