// app/seller/products/[productId]/page.tsx
import Link from "next/link";
import SellerProductDetailsClient from "@/components/seller/SellerProductDetailsClient";

export default function SellerProductDetailsPage({
  params,
}: {
  params: { productId: string };
}) {
  const productId = params.productId;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-3">
        {/* <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-gray-900">Product Details</h1>
          <p className="mt-1 truncate text-sm text-gray-600">Product ID: {productId}</p>
        </div> */}

        <Link
          href="/seller/dashboard"
          className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
        >
          Back
        </Link>
      </div>

      <SellerProductDetailsClient productId={productId} />
    </main>
  );
}