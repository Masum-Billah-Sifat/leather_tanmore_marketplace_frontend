// src/api/sellerProductApi.ts
import axios from "@/utils/axios";
import { unwrapData } from "@/utils//unWrapData";
import type { SellerProductDetail } from "@/types/sellerProductDetail";

type UUID = string;

export async function getSellerProductDetail(productId: string) {
  const res = await axios.get(`/api/seller/products/${productId}`);
  // unwrapData supports {success:true} or {status:"success"} already
  return unwrapData<SellerProductDetail>(res);
}

// 1) Update title/description
export async function updateProductInfo(productId: string, payload: { title?: string; description?: string }) {
  const res = await axios.put(`/api/seller/products/${productId}`, payload);
  return res.data;
}

// 2) Add product media
export async function addProductMedia(productId: string, payload: { media_url: string; media_type: "image" | "video" }) {
  const res = await axios.post(`/api/seller/products/${productId}/media`, payload);
  return res.data;
}

// 3) Archive media (soft delete)
export async function archiveProductMedia(productId: string, mediaId: string, mediaType: "image" | "video") {
  const res = await axios.delete(`/api/seller/products/${productId}/media/${mediaId}`, {
    params: { media_type: mediaType },
  });
  return res.data;
}

// 4) Set primary image
export async function setPrimaryImage(productId: string, mediaId: string) {
  const res = await axios.put(`/api/seller/products/${productId}/images/${mediaId}/set-primary`);
  return res.data;
}

// Product archive
export async function archiveProduct(productId: string) {
  const res = await axios.put(`/api/seller/products/${productId}/archive`);
  return res.data;
}

// Variant: add
export async function addVariant(productId: string, payload: any) {
  const res = await axios.post(`/api/seller/products/${productId}/variants`, payload);
  return res.data;
}

// Variant: archive
export async function archiveVariant(productId: string, variantId: string) {
  const res = await axios.delete(`/api/seller/products/${productId}/variants/${variantId}`);
  return res.data;
}

// Variant updates (single concern each)
export async function updateVariantInfo(productId: string, variantId: string, payload: { color?: string; size?: string }) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/info`, payload);
  return res.data;
}

export async function updateVariantRetailPrice(productId: string, variantId: string, retail_price: number) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/retail-price`, { retail_price });
  return res.data;
}

export async function updateVariantInStock(productId: string, variantId: string, in_stock: boolean) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/in-stock`, { in_stock });
  return res.data;
}

export async function updateVariantStockQty(productId: string, variantId: string, stock_quantity: number) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/stock-quantity`, { stock_quantity });
  return res.data;
}

export async function updateVariantWeight(productId: string, variantId: string, weight_grams: number) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/weight`, { weight_grams });
  return res.data;
}

// Retail discount
export async function addRetailDiscount(productId: string, variantId: string, payload: { retail_discount: number; retail_discount_type: "flat" | "percentage" }) {
  const res = await axios.post(`/api/seller/products/${productId}/variants/${variantId}/retail-discount`, payload);
  return res.data;
}

export async function updateRetailDiscount(productId: string, variantId: string, payload: { retail_discount?: number; retail_discount_type?: "flat" | "percentage" }) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/retail-discount`, payload);
  return res.data;
}

export async function removeRetailDiscount(productId: string, variantId: string) {
  const res = await axios.delete(`/api/seller/products/${productId}/variants/${variantId}/retail-discount`);
  return res.data;
}

// Wholesale mode
export async function enableWholesaleMode(productId: string, variantId: string, payload: any) {
  const res = await axios.post(`/api/seller/products/${productId}/variants/${variantId}/wholesale-mode`, payload);
  return res.data;
}

export async function updateWholesaleMode(productId: string, variantId: string, payload: any) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/wholesale-mode`, payload);
  return res.data;
}

export async function disableWholesaleMode(productId: string, variantId: string) {
  const res = await axios.delete(`/api/seller/products/${productId}/variants/${variantId}/wholesale-mode`);
  return res.data;
}

// Wholesale discount
export async function addWholesaleDiscount(productId: string, variantId: string, payload: { wholesale_discount: number; wholesale_discount_type: "flat" | "percentage" }) {
  const res = await axios.post(`/api/seller/products/${productId}/variants/${variantId}/wholesale-discount`, payload);
  return res.data;
}

export async function updateWholesaleDiscount(productId: string, variantId: string, payload: { wholesale_discount?: number; wholesale_discount_type?: "flat" | "percentage" }) {
  const res = await axios.put(`/api/seller/products/${productId}/variants/${variantId}/wholesale-discount`, payload);
  return res.data;
}

export async function removeWholesaleDiscount(productId: string, variantId: string) {
  const res = await axios.delete(`/api/seller/products/${productId}/variants/${variantId}/wholesale-discount`);
  return res.data;
}

/**
 * TODO: Category update endpoint NOT PROVIDED.
 * Replace CATEGORY_UPDATE_ENDPOINT when you have it.
 */
const CATEGORY_UPDATE_ENDPOINT = (productId: string) => `/api/seller/products/${productId}/category`;
// export async function updateProductCategory(productId: string, category_id: string) {
//   const res = await axios.put(CATEGORY_UPDATE_ENDPOINT(productId), { category_id });
//   return res.data;
// }
export async function updateProductCategory(productId: string, category_id: string) {
  const res = await axios.put(`/api/seller/products/${productId}/category`, { category_id });
  return res.data;
}

/**
 * TODO: Variant recover endpoint NOT PROVIDED.
 * Replace RECOVER_ENDPOINT when you have it.
 */
const RECOVER_ENDPOINT = (productId: string, variantId: string) =>
  `/api/seller/products/${productId}/variants/${variantId}/recover`;
export async function recoverVariant(productId: string, variantId: string) {
  const res = await axios.put(RECOVER_ENDPOINT(productId, variantId));
  return res.data;
}