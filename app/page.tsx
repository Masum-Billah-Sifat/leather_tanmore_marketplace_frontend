"use client";

import { useEffect, useState } from "react";
import axios from "@/utils/axios";
import ProductCard from "@/components/catalog/ProductCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";

type FeedProduct = any;

export default function Home() {
  const { user } = useAuthStore();
  const cart = useCartStore();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<FeedProduct[]>([]);

  useEffect(() => {
    // hydrate cart once if logged in (this is what enables "Add vs Update" everywhere)
    if (user && !cart.hydrated && !cart.loading) {
      cart.fetchCart().catch(() => {});
    }
    if (!user && cart.hydrated) {
      cart.clearLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/feed", { params: { page: 1, per_page: 12 } });
        const payload = res.data?.data ?? res.data; // tolerate shapes
        const items = payload?.products ?? payload?.data?.products ?? [];
        setProducts(items);
      } catch (e) {
        handleApiError(e);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Explore</h1>
          <p className="mt-1 text-sm text-gray-600">
            Minimal feed UI for functionality testing (we’ll enhance later).
          </p>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 text-sm text-gray-500">Loading feed…</div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p: any) => (
            <ProductCard key={p.product_id} product={p} />
          ))}
        </div>
      )}

      {!loading && products.length === 0 ? (
        <div className="mt-10 text-sm text-gray-500">No products returned from feed.</div>
      ) : null}
    </main>
  );
}
