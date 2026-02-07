// components/checkout_review/types.ts
export type ReviewShippingAddress = {
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
  created_at?: string | null;
};

export type ReviewValidItem = {
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

  buying_mode: string;
  unit_price: string;
  has_discount: boolean;
  discount_type?: string | null;
  discount_value?: string | null;

  required_quantity: number;
  weight_grams: number;

  created_at: string;
};

export type ReviewInvalidItem = {
  variant_id: string;
  failure_reason: string;
};

export type ReviewPlatformDiscount = {
  type?: string | null;
  value?: string | null;
  amount_applied?: string | null;
};

export type CheckoutReview = {
  checkout_session_id: string;

  shipping_address: ReviewShippingAddress | null;

  payment_method: "cod" | "prepaid";
  subtotal: string;
  delivery_charge?: string | null;
  total_weight_grams: number;

  platform_discount: ReviewPlatformDiscount;

  total_payable: string;

  valid_items: ReviewValidItem[];
  invalid_items: ReviewInvalidItem[];
};
