// components/checkout/CheckoutItemsHierarchy.tsx
"use client";

import { useMemo } from "react";
import type { CheckoutInvalidItem, CheckoutValidItem } from "./types";

type Grouped = {
  [sellerId: string]: {
    seller_store_name: string;
    categories: {
      [categoryName: string]: {
        products: {
          [productId: string]: {
            product_title: string;
            product_primary_image_url?: string | null;
            variants: CheckoutValidItem[];
          };
        };
      };
    };
  };
};

export default function CheckoutItemsHierarchy({
  validItems,
  invalidItems,
}: {
  validItems: CheckoutValidItem[];
  invalidItems: CheckoutInvalidItem[];
}) {
  const grouped = useMemo(() => {
    const g: Grouped = {};
    for (const it of validItems) {
      if (!g[it.seller_id]) {
        g[it.seller_id] = {
          seller_store_name: it.seller_store_name,
          categories: {},
        };
      }
      const seller = g[it.seller_id];

      if (!seller.categories[it.category_name]) {
        seller.categories[it.category_name] = { products: {} };
      }
      const cat = seller.categories[it.category_name];

      if (!cat.products[it.product_id]) {
        cat.products[it.product_id] = {
          product_title: it.product_title,
          product_primary_image_url: it.product_primary_image_url,
          variants: [],
        };
      }
      cat.products[it.product_id].variants.push(it);
    }
    return g;
  }, [validItems]);

  return (
    <div className="space-y-5">
      {validItems.length === 0 ? (
        <div className="text-sm text-gray-600">No valid items found for this session.</div>
      ) : null}

      {Object.entries(grouped).map(([sellerId, seller]) => (
        <div key={sellerId} className="rounded-2xl border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="text-xs text-gray-600">Seller</div>
            <div className="text-sm font-semibold text-gray-900">{seller.seller_store_name}</div>
          </div>

          <div className="p-4 space-y-4">
            {Object.entries(seller.categories).map(([categoryName, cat]) => (
              <div key={categoryName} className="rounded-2xl border">
                <div className="px-4 py-3 border-b">
                  <div className="text-xs text-gray-600">Category</div>
                  <div className="text-sm font-semibold text-gray-900">{categoryName}</div>
                </div>

                <div className="p-4 space-y-4">
                  {Object.entries(cat.products).map(([productId, p]) => (
                    <div key={productId} className="rounded-2xl border">
                      <div className="flex items-center gap-3 p-4 border-b bg-white">
                        {p.product_primary_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.product_primary_image_url}
                            alt={p.product_title}
                            className="h-12 w-12 rounded-xl object-cover border"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-gray-200 border" />
                        )}

                        <div>
                          <div className="text-sm font-semibold text-gray-900">{p.product_title}</div>
                          <div className="text-xs text-gray-600">Product ID: {productId.slice(0, 8)}…</div>
                        </div>
                      </div>

                      <div className="p-4 space-y-3">
                        {p.variants.map((v) => (
                          <div key={v.variant_id} className="flex items-start justify-between gap-4 rounded-xl border p-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {v.color} / {v.size}
                              </div>
                              <div className="mt-1 text-xs text-gray-600 font-mono break-all">
                                variant_id: {v.variant_id}
                              </div>
                              <div className="mt-1 text-sm text-gray-800">
                                ৳{v.unit_price} × {v.required_quantity}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-600">Weight</div>
                              <div className="text-sm font-medium text-gray-900">
                                {v.weight_grams}g
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {invalidItems?.length ? (
        <div className="rounded-2xl border bg-gray-50 p-4">
          <div className="text-sm font-semibold text-gray-900">Invalid items</div>
          <div className="mt-2 space-y-1">
            {invalidItems.map((x) => (
              <div key={x.variant_id} className="text-sm text-gray-700">
                <span className="font-mono">{x.variant_id.slice(0, 8)}…</span>{" "}
                <span className="text-gray-500">— {x.failure_reason}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
