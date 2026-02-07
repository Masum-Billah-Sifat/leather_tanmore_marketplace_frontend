// components/checkout/types.ts
export type CheckoutSession = {
  id: string;
  user_id: string;
  subtotal: string;
  total_weight_grams: number;
  delivery_charge?: string | null;
  total_payable: string;
  shipping_address_id?: string | null;
  created_at: string;
  status: string; // awaiting_shipping_info | ready_to_order | ...
  platform_discount_type?: string | null;
  platform_discount_value?: string | null;
  platform_discount_amount_applied?: string | null;
  is_platform_discount_applied: boolean;
  payment_method: "cod" | "prepaid";
};

export type ShippingAddress = {
  id: string;
  checkout_session_id?: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string | null;
  address_line: string;
  delivery_note?: string | null;
  city_id: number;
  zone_id: number;
  area_id: number;
  latitude?: string | null;
  longitude?: string | null;
  created_at?: string;
};

export type CheckoutValidItem = {
  id: string;
  checkout_session_id: string;
  user_id: string;

  seller_id: string;
  seller_store_name: string;

  category_id: string;
  category_name: string;

  product_id: string;
  product_title: string;
  product_description?: string | null;
  product_primary_image_url?: string | null;

  variant_id: string;
  color: string;
  size: string;

  buying_mode: string; // retail/wholesale
  unit_price: string; // decimal string
  has_discount: boolean;
  discount_type?: string | null;
  discount_value?: string | null;

  required_quantity: number;
  weight_grams: number;

  created_at: string;
};

export type CheckoutInvalidItem = {
  variant_id: string;
  failure_reason: string;
};

export type CheckoutDetails = {
  checkout_session: CheckoutSession;
  has_shipping_address_details: boolean;
  shipping_address: ShippingAddress | null;
  valid_items: CheckoutValidItem[];
  invalid_items: CheckoutInvalidItem[];
};
