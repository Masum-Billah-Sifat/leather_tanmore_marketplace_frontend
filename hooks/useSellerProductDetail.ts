"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";
import { unwrapData } from "@/utils/unWrapData";
import type { SellerProductDetail } from "@/types/sellerProductDetail";

export function useSellerProductDetail(productId: string) {
  const [raw, setRaw] = useState<any>(null);
  const [product, setProduct] = useState<SellerProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnce = useCallback(async () => {
    const res = await axios.get(`/api/seller/products/${productId}`);
    setRaw(res?.data);
    const data = unwrapData<SellerProductDetail>(res);
    setProduct(data);
  }, [productId]);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      await fetchOnce();
    } catch (err: any) {
      handleApiError(err);
      setProduct(null);
      setError(err?.message || "Failed to load product detail");
    }
  }, [fetchOnce]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!productId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`/api/seller/products/${productId}`);
        if (!mounted) return;
        setRaw(res?.data);
        const data = unwrapData<SellerProductDetail>(res);
        setProduct(data);
      } catch (err: any) {
        handleApiError(err);
        if (!mounted) return;
        setProduct(null);
        setError(err?.message || "Failed to load product detail");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  return { raw, product, loading, error, refresh, setProduct };
}