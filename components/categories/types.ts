export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  level: number;
  is_leaf: boolean;
  children: CategoryNode[];
};

export type CategoryProductVariant = {
  variant_id: string;
  color: string;
  size: string;
  is_in_stock: boolean;
  stock_amount: number;
  retail_price: number;
  retail_discount: number;
  retail_discount_type: string;
  has_retail_discount: boolean;
  has_wholesale_enabled: boolean;
  wholesale_price: number;
  wholesale_min_quantity: number;
  wholesale_discount: number;
  wholesale_discount_type: string;
  weight_grams: number;
};

export type CategoryProduct = {
  product_id: string;
  category_id: string;
  category_name: string;
  seller_id: string;
  seller_store_name: string;
  title: string;
  description: string;
  image_urls: string[];
  promo_video_url?: string | null;
  variants: CategoryProductVariant[];
};
