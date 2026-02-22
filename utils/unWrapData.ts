// // src/utils/unwrapData.ts
// import type { AxiosResponse } from "axios";

// export function unwrapData<T>(res: AxiosResponse<any>): T {
//   if (!res?.data?.success) {
//     const msg = res?.data?.message || "Request failed";
//     throw new Error(msg);
//   }
//   return res.data.data as T;
// }

import type { AxiosResponse } from "axios";

export function unwrapData<T>(res: AxiosResponse<any>): T {
  const body = res?.data;

  const ok =
    body?.success === true ||
    body?.status === "success" ||
    body?.status === true; // (some backends do this)

  if (!ok) {
    const msg = body?.message || "Request failed";
    throw new Error(msg);
  }

  return body.data as T;
}