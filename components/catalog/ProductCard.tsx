// components/catalog/ProductCard.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import VariantPickerModal from "@/components/catalog/VariantPickerModel";
import { Variant } from "@/components/catalog/VariantSelector";



type FeedVariant = Variant & { relevance_score?: number };

// ✅ Accept both frontend-normalized keys and backend keys
export type ProductCardProduct = {
  product_id: string;

  // frontend keys (optional)
  title?: string;
  description?: string | null;
  images?: string[];
  promo_video_url?: string | null;

  // backend keys (optional)
  product_title?: string;
  product_description?: string | null;
  product_images?: string[];
  product_promo_video_url?: string | null;

  seller_store_name?: string;
  category_name?: string;

  variants: Array<FeedVariant | any>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const router = useRouter();

  const images = (
    Array.isArray((product as any).images) && (product as any).images.length
      ? (product as any).images
      : Array.isArray((product as any).product_images) &&
          (product as any).product_images.length
        ? (product as any).product_images
        : Array.isArray((product as any).image_urls) &&
            (product as any).image_urls.length
          ? (product as any).image_urls
          : []
  ) as string[];

  const title = (product as any).title ?? (product as any).product_title ?? "";

  const [imgIdx, setImgIdx] = useState(0);

  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<"add" | "buy">("add");

  const canLeft = imgIdx > 0;
  const canRight = imgIdx < images.length - 1;

  const shortTitle = useMemo(() => {
    const t = title || "";
    return t.length > 52 ? t.slice(0, 52) + "…" : t;
  }, [title]);

  const openModal = (which: "add" | "buy") => {
    setIntent(which);
    setOpen(true);
  };

  const go = (delta: number) => {
    setImgIdx((i) => clamp(i + delta, 0, Math.max(0, images.length - 1)));
  };

  return (
    <>
      <div
        onClick={() => router.push(`/products/${product.product_id}`)}
        className={[
          "group cursor-pointer rounded-2xl border border-black/10",
          "bg-[rgb(var(--surface))] shadow-sm overflow-hidden",
          // ✅ pop-on-hover
          "transform-gpu transition duration-200 ease-out",
          "hover:shadow-lg hover:-translate-y-1 hover:scale-[1.04] hover:z-10",
          "focus-within:shadow-lg focus-within:-translate-y-1 focus-within:scale-[1.02] focus-within:z-10",
          // ✅ make it a flex column so footer can stick
          "flex flex-col",
        ].join(" ")}
      >
        <div className="relative">
          <div className="relative aspect-[4/3] bg-black/5">
            {images.length > 0 ? (
              <Image
                src={images[imgIdx]}
                alt={title}
                fill
                priority={false}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-[rgb(var(--muted))]">
                No image
              </div>
            )}

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

            {images.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canLeft) go(-1);
                  }}
                  disabled={!canLeft}
                  className={[
                    "absolute left-3 top-1/2 -translate-y-1/2",
                    "rounded-full border border-black/10 bg-[rgb(var(--surface))]/90 backdrop-blur",
                    "px-2 py-1 text-sm font-medium transition",
                    "opacity-0 pointer-events-none",
                    "group-hover:opacity-100 group-hover:pointer-events-auto",
                    "group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Previous image"
                >
                  ←
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canRight) go(1);
                  }}
                  disabled={!canRight}
                  className={[
                    "absolute right-3 top-1/2 -translate-y-1/2",
                    "rounded-full border border-black/10 bg-[rgb(var(--surface))]/90 backdrop-blur",
                    "px-2 py-1 text-sm font-medium transition",
                    "opacity-0 pointer-events-none",
                    "group-hover:opacity-100 group-hover:pointer-events-auto",
                    "group-focus-within:opacity-100 group-focus-within:pointer-events-auto",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                  ].join(" ")}
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* ✅ flex-1 content + sticky footer buttons */}
        <div className="p-4 flex flex-col flex-1">
          <div className="font-display text-base font-semibold text-[rgb(var(--text))] leading-snug">
            {shortTitle}
          </div>

          <div className="mt-1 text-xs text-[rgb(var(--muted))]">
            {product.seller_store_name ? product.seller_store_name : " "}
            {product.category_name ? <span className="ml-2">• {product.category_name}</span> : null}
          </div>

          {/* pushes buttons to bottom even if title/meta are short */}
          <div className="mt-auto pt-4 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal("add");
              }}
              className={[
                "flex-1 rounded-xl px-2 py-1 font-medium text-sm",
                "bg-[rgb(var(--brand))] text-white hover:opacity-95",
              ].join(" ")}
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal("buy");
              }}
              className={[
                "flex-1 rounded-xl border px-2 py-1 font-medium text-sm",
                "border-[rgb(var(--brand))]/30 text-[rgb(var(--brand-strong))]",
                "hover:bg-[rgb(var(--brand))]/10",
              ].join(" ")}
            >
              Buy now
            </button>
          </div>
        </div>
      </div>

      <VariantPickerModal
        open={open}
        onClose={() => setOpen(false)}
        intent={intent}
        product={{
          product_id: product.product_id,
          title: title,
          images: images ?? [],
          variants: product.variants ?? [],
        }}
      />
    </>
  );
}
