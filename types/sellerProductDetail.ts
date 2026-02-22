// src/types/sellerProductDetail.ts
import type { UUID, SellerVariant } from "@/types/sellerProducts";
import type { ProductMediaItem } from "@/types/sellerMedia";

export type SellerProductDetail = {
  product_id: UUID;
  title: string;
  description?: string | null;

  category_id?: UUID | null;
  category_name?: string | null;

  seller_id: UUID;
  seller_store_name: string;

  is_product_approved?: boolean;

  // NEW: media items (matches your real JSON)
  image_media_items?: ProductMediaItem[] | null;
  archived_image_media_items?: ProductMediaItem[] | null;
  primary_image_item?: ProductMediaItem | null;

  // Promo video fields may vary; support both
  promo_video_media_item?: ProductMediaItem | null;
  promo_video_media_items?: ProductMediaItem[] | null;
  archived_promo_video_media_items?: ProductMediaItem[] | null;

  valid_variants?: SellerVariant[] | null;
  archived_variants?: SellerVariant[] | null;
};