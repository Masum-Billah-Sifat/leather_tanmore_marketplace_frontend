"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import VariantPickerModal from "@/components/catalog/VariantPickerModel";
import { Variant } from "@/components/catalog/VariantSelector";

type FeedVariant = Variant & {
  relevance_score?: number;
};

type FeedProduct = {
  product_id: string;
  title: string;
  description?: string | null;
  images: string[];
  promo_video_url?: string | null;
  seller_store_name?: string;
  category_name?: string;
  variants: FeedVariant[];
};

export default function ProductCard({ product }: { product: FeedProduct }) {
  const router = useRouter();
  const images = product.images ?? [];
  const [imgIdx, setImgIdx] = useState(0);

  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<"add" | "buy">("add");

  const canLeft = imgIdx > 0;
  const canRight = imgIdx < images.length - 1;

  const shortTitle = useMemo(() => {
    const t = product.title || "";
    return t.length > 48 ? t.slice(0, 48) + "…" : t;
  }, [product.title]);

  const openModal = (which: "add" | "buy") => {
    setIntent(which);
    setOpen(true);
  };

  return (
    <>
      <div
        onClick={() => router.push(`/products/${product.product_id}`)}
        className="cursor-pointer rounded-2xl border bg-white shadow-sm hover:shadow-md transition overflow-hidden"
      >
        <div className="relative">
          <div className="aspect-[4/3] bg-gray-100">
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[imgIdx]}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
                No image
              </div>
            )}
          </div>

          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canLeft) setImgIdx((i) => i - 1);
                }}
                disabled={!canLeft}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border px-3 py-2 text-sm disabled:opacity-40"
              >
                ←
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (canRight) setImgIdx((i) => i + 1);
                }}
                disabled={!canRight}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 border px-3 py-2 text-sm disabled:opacity-40"
              >
                →
              </button>
            </>
          ) : null}
        </div>

        <div className="p-4">
          <div className="text-sm font-semibold text-gray-900">{shortTitle}</div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal("add");
              }}
              className="flex-1 rounded-xl bg-black px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Add to cart
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openModal("buy");
              }}
              className="flex-1 rounded-xl border px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
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
          title: product.title,
          images: product.images ?? [],
          variants: product.variants ?? [],
        }}
      />
    </>
  );
}
