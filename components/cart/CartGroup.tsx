// components/cart/CartGroup.tsx
"use client";

import Image from "next/image";
import CartVariantRow from "@/components/cart/CartVariantRow";

function pickAccent(seed: string) {
  const accents = [
    { header: "bg-amber-50", ring: "ring-amber-200/60", badge: "bg-amber-100 text-amber-900 border-amber-200/60" },
    { header: "bg-orange-50", ring: "ring-orange-200/60", badge: "bg-orange-100 text-orange-900 border-orange-200/60" },
    { header: "bg-stone-50", ring: "ring-stone-200/60", badge: "bg-stone-100 text-stone-900 border-stone-200/60" },
    { header: "bg-rose-50", ring: "ring-rose-200/60", badge: "bg-rose-100 text-rose-900 border-rose-200/60" },
  ];

  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return accents[h % accents.length];
}

export default function CartGroup({ seller }: { seller: any }) {
  const accent = pickAccent(String(seller?.seller_id ?? seller?.store_name ?? "seller"));

  return (
    <section
      className={[
        "rounded-3xl border border-black/10 bg-[rgb(var(--surface))] shadow-sm overflow-hidden",
        "ring-1",
        accent.ring,
      ].join(" ")}
    >
      <div className={["px-6 py-5 border-b border-black/10", accent.header].join(" ")}>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs tracking-wide uppercase text-[rgb(var(--muted))]">
              Seller
            </div>
            <div className="mt-1 font-display text-xl font-semibold text-[rgb(var(--text))]">
              {seller.store_name}
            </div>
          </div>

          <div className={["rounded-full border px-3 py-1 text-xs font-semibold", accent.badge].join(" ")}>
            {seller.products?.length ?? 0} products
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {seller.products.map((p: any) => {
          // ✅ BACKEND FIELD NAME (from your logs)
          const img =
            p?.product_primary_image_url ||
            p?.product_primary_image || // fallback if backend changes later
            "";

          return (
            <div
              key={p.product_id}
              className="rounded-3xl border border-black/10 bg-white overflow-hidden"
            >
              <div className="flex items-center gap-4 p-5 border-b border-black/10 bg-black/[0.02]">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                  {img ? (
                    <Image
                      src={img}
                      alt={p.product_title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[10px] text-[rgb(var(--muted))]">
                      No image
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="truncate font-display text-base font-semibold text-[rgb(var(--text))]">
                      {p.product_title}
                    </div>

                    {p.category_name ? (
                      <span className="inline-flex rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-[rgb(var(--muted))]">
                        {p.category_name}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="px-5 py-2">
                {p.variants.map((v: any) => (
                  <CartVariantRow key={v.variant_id} productId={p.product_id} v={v} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
