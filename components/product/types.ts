import type { Variant } from "@/components/catalog/VariantSelector";

export type ProductDetail = {
  product_id: string;
  title: string;
  description?: string | null;
  category_name?: string;
  seller_store_name?: string;
  images: string[];
  promo_video_url?: string | null;
  variants: Variant[];
};
