// "use client";

// import { useEffect, useMemo, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { handleApiError } from "@/utils/handleApiError";
// import { fetchCategoryProducts } from "@/components/categories/api";
// import type { CategoryProduct } from "@/components/categories/types";
// import CategoryProductCard from "@/components/categories/CategoryProductCard";

// export default function CategoryPage() {
//   const router = useRouter();
//   const params = useParams();
//   const categoryId = String(params?.categoryId ?? "");

//   const [loading, setLoading] = useState(false);
//   const [products, setProducts] = useState<CategoryProduct[]>([]);

//   const categoryName = useMemo(() => {
//     return products?.[0]?.category_name ?? "Category";
//   }, [products]);

//   useEffect(() => {
//     if (!categoryId) return;
//     const run = async () => {
//       setLoading(true);
//       try {
//         const items = await fetchCategoryProducts(categoryId);
//         setProducts(Array.isArray(items) ? items : []);
//       } catch (e) {
//         handleApiError(e);
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     run();
//   }, [categoryId]);

//   return (
//     <main className="mx-auto max-w-7xl px-6 py-10">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <div className="text-sm text-gray-600">Category</div>
//           <h1 className="mt-1 text-2xl font-semibold text-gray-900">{categoryName}</h1>
//           <div className="mt-2 text-xs text-gray-500 font-mono break-all">
//             category_id: {categoryId}
//           </div>
//         </div>

//         <button
//           onClick={() => router.push("/")}
//           className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
//         >
//           Back to home
//         </button>
//       </div>

//       {loading ? (
//         <div className="mt-8 text-sm text-gray-500">Loading products…</div>
//       ) : products.length ? (
//         <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
//           {products.map((p) => (
//             <CategoryProductCard key={p.product_id} product={p} />
//           ))}
//         </div>
//       ) : (
//         <div className="mt-8 text-sm text-gray-600">No products found for this category.</div>
//       )}
//     </main>
//   );
// }


"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { handleApiError } from "@/utils/handleApiError";
import { fetchCategoryProducts } from "@/components/categories/api";
import type { CategoryProduct } from "@/components/categories/types";
import ProductCard from "@/components/catalog/ProductCard";

type FeedLikeProduct = any;

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = String(params?.categoryId ?? "");

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<CategoryProduct[]>([]);

  const categoryName = useMemo(() => {
    return products?.[0]?.category_name ?? "Category";
  }, [products]);

  useEffect(() => {
    if (!categoryId) return;
    const run = async () => {
      setLoading(true);
      try {
        const items = await fetchCategoryProducts(categoryId);
        setProducts(Array.isArray(items) ? items : []);
      } catch (e) {
        handleApiError(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [categoryId]);

  // Adapter: CategoryProduct -> “feed-like” shape that ProductCard already supports
  const feedLikeProducts: FeedLikeProduct[] = useMemo(() => {
    return (products ?? []).map((p) => ({
      product_id: p.product_id,
      title: p.title,
      description: p.description,
      // ProductCard already supports image_urls, but we also provide images for consistency
      images: p.image_urls ?? [],
      image_urls: p.image_urls ?? [],
      promo_video_url: p.promo_video_url ?? null,
      seller_store_name: p.seller_store_name,
      category_name: p.category_name,

      // map variants into your VariantSelector's expected-ish fields
      variants: (p.variants ?? []).map((v) => ({
        variant_id: v.variant_id,
        color: v.color,
        size: v.size,

        retail_price: v.retail_price,
        has_retail_discount: v.has_retail_discount,
        retail_discount: v.retail_discount ?? null,
        retail_discount_type: v.retail_discount_type ?? null,

        // VariantSelector uses wholesale_* naming; your category API uses has_wholesale_enabled
        wholesale_enabled: v.has_wholesale_enabled ?? false,
        wholesale_price: v.wholesale_price ?? null,
        wholesale_min_quantity: v.wholesale_min_quantity ?? null,

        // stock fields (VariantSelector tolerates optional fields)
        in_stock: v.is_in_stock,
        stock_amount: v.stock_amount,

        weight_grams: v.weight_grams,

        // keep extra wholesale discount fields too (harmless, and useful for later UI)
        wholesale_discount: v.wholesale_discount ?? null,
        wholesale_discount_type: v.wholesale_discount_type ?? null,
      })),
    }));
  }, [products]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs tracking-wide uppercase text-[rgb(var(--muted))]">
            Category
          </div>
          <h1 className="mt-1 font-display text-3xl font-semibold text-[rgb(var(--text))] tracking-tight">
            {categoryName}
          </h1>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            {products.length ? `${products.length} items` : " "}
          </div>
        </div>

        <button
          onClick={() => router.push("/")}
          className="rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
        >
          Back to home
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-black/10 bg-[rgb(var(--surface))] overflow-hidden"
            >
              <div className="aspect-[4/3] bg-black/5 animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-3/4 bg-black/10 rounded animate-pulse" />
                <div className="h-9 w-full bg-black/10 rounded-xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : feedLikeProducts.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {feedLikeProducts.map((p: any) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-sm text-[rgb(var(--muted))]">
          No products found for this category.
        </div>
      )}
    </div>
  );
}
