// // src/hooks/useSellerProducts.ts
// "use client";

// import { useEffect, useMemo, useState } from "react";
// import axios from "@/utils/axios";
// import { handleApiError } from "@/utils/handleApiError";
// import { unwrapData } from "@/utils/unWrapData";
// import type { SellerProductCardModel, SellerProductsPayload } from "@/types/sellerProducts";

// export function useSellerProducts() {
//   const [payload, setPayload] = useState<SellerProductsPayload | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     let mounted = true;

//     (async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get("/api/seller/products");
//         const data = unwrapData<SellerProductsPayload>(res);
//         if (mounted) setPayload(data);
//       } catch (err) {
//         handleApiError(err);
//         if (mounted) setPayload(null);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const validProducts: SellerProductCardModel[] = useMemo(() => {
//     if (!payload) return [];

//     const approved = (payload.valid_approved_products || []).map((p) => ({
//       ...p,
//       approval_status: "approved" as const,
//     }));

//     const pending = (payload.valid_non_approved_products || []).map((p) => ({
//       ...p,
//       approval_status: "pending" as const,
//     }));

//     // Minimal sorting for nicer UX (optional)
//     return [...approved, ...pending].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
//   }, [payload]);

//   return {
//     payload,
//     validProducts,
//     loading,
//   };
// }

"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";
import { unwrapData } from "@/utils/unWrapData";
import type { SellerProductCardModel, SellerProductsPayload } from "@/types/sellerProducts";

export function useSellerProducts() {
  const [payload, setPayload] = useState<SellerProductsPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/api/seller/products");
        const data = unwrapData<SellerProductsPayload>(res);
        if (mounted) setPayload(data);
      } catch (err: any) {
        handleApiError(err);
        if (mounted) {
          setPayload(null);
          setError(err?.message || "Failed to load seller products");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const validProducts: SellerProductCardModel[] = useMemo(() => {
    if (!payload) return [];

    // Backend currently returns valid_products (approved list)
    const approvedSrc =
      payload.valid_products ??
      payload.valid_approved_products ??
      [];

    const pendingSrc = payload.valid_non_approved_products ?? [];

    const approved = approvedSrc.map((p) => ({ ...p, approval_status: "approved" as const }));
    const pending = pendingSrc.map((p) => ({ ...p, approval_status: "pending" as const }));

    return [...approved, ...pending].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }, [payload]);

  return { payload, validProducts, loading, error };
}