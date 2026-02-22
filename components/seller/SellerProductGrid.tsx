// src/components/seller/SellerProductGrid.tsx
import SellerProductCard from "@/components/seller/SellerProductCard";
import type { SellerProductCardModel } from "@/types/sellerProducts";

export default function SellerProductGrid({ products }: { products: SellerProductCardModel[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <SellerProductCard key={p.product_id} product={p} />
      ))}
    </div>
  );
}