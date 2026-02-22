// src/types/sellerMedia.ts
export type UUID = string;

export type ProductMediaItem = {
  media_id: UUID;
  media_type: "image" | "promo_video" | string;
  media_url: string;
  is_primary: boolean;
  is_archived: boolean;
};