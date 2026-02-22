// src/components/seller/SellerProductCard.tsx
import Link from "next/link";
import type { SellerProductCardModel } from "@/types/sellerProducts";

function Badge({ status }: { status: "approved" | "pending" }) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border";
  if (status === "approved") {
    return <span className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>Approved</span>;
  }
  return <span className={`${base} border-amber-200 bg-amber-50 text-amber-700`}>Pending</span>;
}

export default function SellerProductCard({ product }: { product: SellerProductCardModel }) {
  const href = `/seller/products/${product.product_id}`;

  const img = product.primary_image_url || product.image_urls?.[0] || "";
  const category = product.category_name || "Uncategorized";
  const variantsCount = product.valid_variants?.length ?? 0;

  return (
    <Link
      href={href}
      className="group block rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-black/20"
      aria-label={`Open product ${product.title}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border bg-gray-50">
          {img ? (
            // Using <img> avoids Next Image remote config issues
            <img
              src={img}
              alt={product.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
              No image
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-sm font-semibold text-gray-900 group-hover:underline">
              {product.title}
            </p>
            <Badge status={product.approval_status} />
          </div>

          <p className="mt-1 truncate text-xs text-gray-600">{category}</p>

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>{variantsCount} variants</span>
            {/* <span className="text-gray-300">•</span>
            <span className="truncate">ID: {product.product_id}</span> */}
          </div>
        </div>
      </div>
    </Link>
  );
}