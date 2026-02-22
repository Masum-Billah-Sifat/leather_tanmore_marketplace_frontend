// src/types/sellerProducts.ts
export type UUID = string;

export type SellerVariant = {
  variant_id: UUID;
  color: string;
  size: string;

  retail_price: number;
  has_retail_discount: boolean;
  retail_discount?: number | null;
  retail_discount_type?: "fixed" | "percentage" | string | null;

  is_in_stock: boolean;
  stock_quantity: number;

  has_wholesale_enabled: boolean;
  wholesale_price?: number | null;
  wholesale_min_quantity?: number | null;
  wholesale_discount?: number | null;
  wholesale_discount_type?: "fixed" | "percentage" | string | null;

  weight_grams: number;
  is_variant_archived: boolean;
};

export type SellerProduct = {
  product_id: UUID;
  title: string;
  description?: string | null;

  category_id?: UUID | null;
  category_name?: string | null;

  image_urls?: string[];
  promo_video_url?: string | null;
  primary_image_url?: string | null;

  valid_variants?: SellerVariant[];
  archived_variants?: SellerVariant[];
};

// export type SellerProductsPayload = {
//   seller_id: UUID;
//   seller_store_name: string;

//   valid_approved_products: SellerProduct[];
//   valid_non_approved_products: SellerProduct[];

//   archived_products: SellerProduct[];
//   banned_products: SellerProduct[];
// };


export type SellerProductsPayload = {
  seller_id: UUID;
  seller_store_name: string;

  // NEW backend field
  valid_products?: SellerProduct[];

  // Existing doc field (keep optional for compatibility)
  valid_approved_products?: SellerProduct[];

  valid_non_approved_products?: SellerProduct[];

  archived_products?: SellerProduct[] | null;
  banned_products?: SellerProduct[] | null;
};

export type SellerProductCardModel = SellerProduct & {
  approval_status: "approved" | "pending";
};