// components/checkout_review/api.ts
import axios from "@/utils/axios";
import type { CheckoutReview } from "./types";
import { normalizeCheckoutReview } from "./normalize";

function unwrapApi<T>(resData: any): T {
  const lvl1 = resData?.data ?? resData;
  const lvl2 = lvl1?.data ?? lvl1;
  return lvl2 as T;
}

export async function fetchCheckoutReview(sessionId: string): Promise<CheckoutReview> {
  const res = await axios.get(`/api/checkout/${sessionId}/review`);
  const raw = unwrapApi<any>(res.data);
  return normalizeCheckoutReview(raw);
}

export async function confirmOrder(sessionId: string): Promise<any> {
  const res = await axios.post(`/api/checkout/${sessionId}/confirm`);
  return unwrapApi<any>(res.data);
}
