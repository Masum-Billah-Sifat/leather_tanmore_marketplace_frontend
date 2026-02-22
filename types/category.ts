// src/types/category.ts
export type CategoryNode = {
  id: string;
  name: string;
  slug?: string;
  level: number;
  is_leaf: boolean;
  children: CategoryNode[];
};