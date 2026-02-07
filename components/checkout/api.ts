// // components/checkout/api.ts
// import axios from "@/utils/axios";
// import type { CheckoutDetails } from "./types";

// function unwrapApi<T>(resData: any): T {
//   // tolerates:
//   // 1) { success:true, data:{...} }
//   // 2) { status:"success", data:{...} }
//   // 3) { ...directPayload }
//   const lvl1 = resData?.data ?? resData;
//   const lvl2 = lvl1?.data ?? lvl1;
//   return lvl2 as T;
// }

// export async function fetchCheckoutDetails(sessionId: string): Promise<CheckoutDetails> {
//   const res = await axios.get(`/api/checkout/${sessionId}`);
//   return unwrapApi<CheckoutDetails>(res.data);
// }

// export async function addShippingAddress(sessionId: string, body: any) {
//   const res = await axios.post(`/api/checkout/${sessionId}/add-shipping-address`, body);
//   return unwrapApi<any>(res.data);
// }

// export async function editShippingAddress(
//   sessionId: string,
//   shippingAddressId: string,
//   body: any
// ) {
//   const res = await axios.put(
//     `/api/checkout/${sessionId}/shipping-address/${shippingAddressId}/edit`,
//     body
//   );
//   return unwrapApi<any>(res.data);
// }

// components/checkout/api.ts
import axios from "@/utils/axios";
import type { CheckoutDetails } from "./types";
import { normalizeCheckoutDetails } from "./normalize";

function unwrapApi<T>(resData: any): T {
  const lvl1 = resData?.data ?? resData;
  const lvl2 = lvl1?.data ?? lvl1;
  return lvl2 as T;
}

export async function fetchCheckoutDetails(sessionId: string): Promise<CheckoutDetails> {
  const res = await axios.get(`/api/checkout/${sessionId}`);
  const raw = unwrapApi<any>(res.data);
  return normalizeCheckoutDetails(raw);
}

export async function addShippingAddress(sessionId: string, body: any) {
  const res = await axios.post(`/api/checkout/${sessionId}/add-shipping-address`, body);
  return unwrapApi<any>(res.data);
}

export async function editShippingAddress(sessionId: string, shippingAddressId: string, body: any) {
  const res = await axios.put(
    `/api/checkout/${sessionId}/shipping-address/${shippingAddressId}/edit`,
    body
  );
  return unwrapApi<any>(res.data);
}
