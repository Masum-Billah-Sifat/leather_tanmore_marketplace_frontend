import axios from "@/utils/axios";
import type { CategoryNode, CategoryProduct } from "./types";

function unwrapApi<T>(resData: any): T {
  // tolerates:
  // 1) { success:true, data: ... }
  // 2) { status:"success", data: ... }
  // 3) direct payload
  const lvl1 = resData?.data ?? resData;
  const lvl2 = lvl1?.data ?? lvl1;
  return lvl2 as T;
}

export async function fetchCategoryTree(): Promise<CategoryNode[]> {
  const res = await axios.get("/api/categories/tree");
  return unwrapApi<CategoryNode[]>(res.data) ?? [];
}

export async function fetchCategoryProducts(categoryId: string): Promise<CategoryProduct[]> {
  const res = await axios.get("/api/category-products", { params: { category_id: categoryId } });
  return unwrapApi<CategoryProduct[]>(res.data) ?? [];
}
