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

function money(x: any) {
  const n = Number.parseFloat(String(x ?? "0"));
  const safe = Number.isFinite(n) ? n : 0;
  return `৳${safe.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function titleCase(s: string) {
  return (s || "").replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

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
    <div className="space-y-6">
      {validItems.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
          No valid items found for this session.
        </div>
      ) : null}

      {Object.entries(grouped).map(([sellerId, seller]) => (
        <section
          key={sellerId}
          className="rounded-3xl border border-black/10 bg-white overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-black/10 bg-black/[0.02]">
            <div className="text-xs tracking-wide uppercase text-[rgb(var(--muted))]">
              Seller
            </div>
            <div className="mt-1 font-display text-lg font-semibold text-[rgb(var(--text))]">
              {seller.seller_store_name}
            </div>
          </div>

          <div className="p-5 space-y-5">
            {Object.entries(seller.categories).map(([categoryName, cat]) => (
              <div key={categoryName} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex rounded-full border border-black/10 bg-[rgb(var(--brand))]/10 px-3 py-1 text-xs font-semibold text-[rgb(var(--brand-strong))]">
                    {categoryName}
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(cat.products).map(([productId, p]) => (
                    <div
                      key={productId}
                      className="rounded-3xl border border-black/10 overflow-hidden"
                    >
                      <div className="flex items-center gap-4 p-5 border-b border-black/10 bg-[rgb(var(--surface))]">
                        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-black/10 bg-black/5 flex-none">
                          {p.product_primary_image_url ? (
                            // keep <img> to avoid Next/Image domain config issues
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.product_primary_image_url}
                              alt={p.product_title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] text-[rgb(var(--muted))]">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="truncate font-display text-base font-semibold text-[rgb(var(--text))]">
                            {p.product_title}
                          </div>
                          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                            {p.variants.length} variant{p.variants.length === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 space-y-3">
                        {p.variants.map((v) => {
                          const unit = Number.parseFloat(String(v.unit_price ?? "0")) || 0;
                          const qty = Number(v.required_quantity ?? 0) || 0;
                          const lineTotal = unit * qty;

                          return (
                            <div
                              key={v.variant_id}
                              className="rounded-2xl border border-black/10 bg-white p-4"
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-semibold text-[rgb(var(--text))]">
                                      {v.color} / {v.size}
                                    </div>

                                    <span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--text))]">
                                      {titleCase(v.buying_mode)}
                                    </span>

                                    {v.has_discount ? (
                                      <span className="inline-flex rounded-full border border-black/10 bg-[rgb(var(--brand))]/10 px-2.5 py-1 text-xs font-semibold text-[rgb(var(--brand-strong))]">
                                        Discount
                                      </span>
                                    ) : null}
                                  </div>

                                  {v.has_discount ? (
                                    <div className="mt-1 text-xs text-[rgb(var(--muted))]">
                                      {v.discount_type ? `${v.discount_type}` : "discount"}{" "}
                                      {v.discount_value ? `• ${v.discount_value}` : ""}
                                    </div>
                                  ) : null}

                                  <div className="mt-2 flex flex-wrap items-baseline gap-2 text-sm">
                                    <div className="text-[rgb(var(--muted))]">
                                      Qty{" "}
                                      <span className="font-semibold text-[rgb(var(--text))]">
                                        {qty}
                                      </span>
                                    </div>

                                    <div className="text-[rgb(var(--muted))]">•</div>

                                    <div className="text-[rgb(var(--muted))]">
                                      Unit{" "}
                                      <span className="font-semibold text-[rgb(var(--text))]">
                                        {money(unit)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <div className="text-xs text-[rgb(var(--muted))]">
                                    Line total
                                  </div>
                                  <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                                    {money(lineTotal)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {invalidItems?.length ? (
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6">
          <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
            Skipped items
          </div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            These items could not be included in checkout.
          </div>

          <div className="mt-4 space-y-2">
            {invalidItems.map((x) => (
              <div
                key={x.variant_id}
                className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
              >
                <div className="font-semibold text-[rgb(var(--text))]">Item</div>
                <div className="mt-1 text-[rgb(var(--muted))]">{x.failure_reason}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
