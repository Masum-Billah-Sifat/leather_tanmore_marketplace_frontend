"use client";

import CartVariantRow from "@/components/cart/CartVariantRow";

export default function CartGroup({ seller }: { seller: any }) {
  return (
    <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b">
        <div className="text-sm text-gray-600">Seller</div>
        <div className="text-lg font-semibold text-gray-900">{seller.store_name}</div>
      </div>

      <div className="p-5 space-y-6">
        {seller.products.map((p: any) => (
          <div key={p.product_id} className="rounded-2xl border">
            <div className="flex items-center gap-4 p-4 border-b bg-gray-50">
              {p.product_primary_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.product_primary_image}
                  alt={p.product_title}
                  className="h-14 w-14 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-14 w-14 rounded-xl bg-gray-200 border" />
              )}

              <div>
                <div className="text-sm font-semibold text-gray-900">{p.product_title}</div>
                <div className="text-xs text-gray-600">{p.category_name}</div>
              </div>
            </div>

            <div className="p-4">
              {p.variants.map((v: any) => (
                <CartVariantRow key={v.variant_id} productId={p.product_id} v={v} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
