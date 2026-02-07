// utils/checkout.ts
import axios from "@/utils/axios";

function extractSessionId(res: any): string {
  // expected: { success/status, message, data: { checkout_session_id } }
  const id =
    res?.data?.data?.checkout_session_id ??
    res?.data?.checkout_session_id ??
    res?.data?.data?.data?.checkout_session_id;

  if (!id || typeof id !== "string") {
    throw new Error("Checkout session id missing from response");
  }
  return id;
}

export async function initiateCheckoutFromProduct(args: {
  variant_id: string;
  quantity: number;
}): Promise<string> {
  const res = await axios.post("/api/cart/checkout/initiate", {
    source: "product",
    variant_id: args.variant_id,
    quantity: args.quantity,
  });
  return extractSessionId(res);
}

export async function initiateCheckoutFromCart(args: {
  variant_ids: string[];
}): Promise<string> {
  const res = await axios.post("/api/cart/checkout/initiate", {
    source: "cart",
    variant_ids: args.variant_ids,
  });
  return extractSessionId(res);
}
