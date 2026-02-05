import { create } from "zustand";
import axios from "@/utils/axios";
import { useAuthStore } from "@/stores/useAuthStore";

type CartVariantLine = {
  variant_id: string;
  color: string;
  size: string;
  retail_price: number;
  has_retail_discount?: boolean;
  retail_discount?: number | null;
  retail_discount_type?: "flat" | "percentage" | null;
  has_wholesale_enabled?: boolean;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  has_wholesale_discount?: boolean;
  wholesale_discount?: number | null;
  wholesale_discount_type?: "flat" | "percentage" | null;
  weight_grams: number;
  quantity_in_cart: number;
};

type CartProductGroup = {
  product_id: string;
  category_name: string;
  product_title: string;
  product_description?: string | null;
  product_primary_image?: string | null;
  variants: CartVariantLine[];
};

type CartSellerGroup = {
  seller_id: string;
  store_name: string;
  products: CartProductGroup[];
};

type CartInvalidItem = {
  variant_id: string;
  reason: string;
  product_id?: string;
  product_title?: string;
  color?: string;
  size?: string;
};

type CartItemsResponse = {
  valid_items: CartSellerGroup[];
  invalid_items: CartInvalidItem[];
};

type CartSummaryInvalidItem = {
  variant_id: string;
  reason: string;
  product_id?: string;
  product_title?: string;
  color?: string;
  size?: string;
};

type CartSummary = {
  total_price: number;
  invalid_items: CartSummaryInvalidItem[];
};

type CartItemMini = {
  variant_id: string;
  quantity: number;
  product_id?: string;
};

type State = {
  hydrated: boolean;
  loading: boolean;

  groups: CartSellerGroup[];
  invalidItems: CartInvalidItem[];

  itemsByVariantId: Record<string, CartItemMini>;

  selected: Record<string, boolean>;

  summaryLoading: boolean;
  summary?: CartSummary;

  fetchCart: () => Promise<void>;
  clearLocal: () => void;

  isInCart: (variant_id: string) => boolean;
  getQty: (variant_id: string) => number;

  addToCart: (args: { product_id: string; variant_id: string; qty: number }) => Promise<void>;
  updateQty: (args: { variant_id: string; qty: number }) => Promise<void>;
  removeItem: (variant_id: string) => Promise<void>;
  clearCart: () => Promise<void>;

  toggleSelect: (variant_id: string) => void;
  selectAll: () => void;
  unselectAll: () => void;

  refreshSummary: () => Promise<void>;
};

function buildVariantMap(groups: CartSellerGroup[]): Record<string, CartItemMini> {
  const map: Record<string, CartItemMini> = {};
  for (const seller of groups) {
    for (const p of seller.products) {
      for (const v of p.variants) {
        map[v.variant_id] = {
          variant_id: v.variant_id,
          quantity: v.quantity_in_cart,
          product_id: p.product_id,
        };
      }
    }
  }
  return map;
}

export const useCartStore = create<State>((set, get) => ({
  hydrated: false,
  loading: false,

  groups: [],
  invalidItems: [],
  itemsByVariantId: {},

  selected: {},

  summaryLoading: false,
  summary: undefined,

  clearLocal: () => {
    set({
      hydrated: false,
      loading: false,
      groups: [],
      invalidItems: [],
      itemsByVariantId: {},
      selected: {},
      summaryLoading: false,
      summary: undefined,
    });
  },

  fetchCart: async () => {
    const { user, isLoggingOut } = useAuthStore.getState();
    if (!user || isLoggingOut) return;

    set({ loading: true });
    try {
      const res = await axios.get("/api/cart/items");
      const payload = res.data?.data ?? res.data; // tolerate either {data:{...}} or direct

      const cart: CartItemsResponse = payload;

      const groups = cart.valid_items ?? [];
      const invalidItems = cart.invalid_items ?? [];
      const itemsByVariantId = buildVariantMap(groups);

      set((prev) => {
        // preserve selection where possible; if no previous selection, default select all
        const prevSelected = prev.selected || {};
        const nextSelected: Record<string, boolean> = {};

        const hasAnyPrevSelection = Object.keys(prevSelected).length > 0;

        if (hasAnyPrevSelection) {
          for (const vid of Object.keys(itemsByVariantId)) {
            if (prevSelected[vid]) nextSelected[vid] = true;
          }
        } else {
          for (const vid of Object.keys(itemsByVariantId)) nextSelected[vid] = true;
        }

        return {
          hydrated: true,
          groups,
          invalidItems,
          itemsByVariantId,
          selected: nextSelected,
        };
      });
    } finally {
      set({ loading: false });
    }
  },

  isInCart: (variant_id) => !!get().itemsByVariantId[variant_id],
  getQty: (variant_id) => get().itemsByVariantId[variant_id]?.quantity ?? 0,

  addToCart: async ({ product_id, variant_id, qty }) => {
    const { user, isLoggingOut } = useAuthStore.getState();
    if (!user || isLoggingOut) throw new Error("Not logged in");

    await axios.post("/api/cart/add", {
      product_id,
      variant_id,
      required_quantity: qty,
    });

    // simplest + correct: re-fetch canonical cart
    await get().fetchCart();
  },

  updateQty: async ({ variant_id, qty }) => {
    const { user, isLoggingOut } = useAuthStore.getState();
    if (!user || isLoggingOut) throw new Error("Not logged in");

    await axios.put("/api/cart/update", {
      variant_id,
      required_quantity: qty,
    });

    await get().fetchCart();
  },

  removeItem: async (variant_id) => {
    const { user, isLoggingOut } = useAuthStore.getState();
    if (!user || isLoggingOut) throw new Error("Not logged in");

    await axios.delete(`/api/cart/remove/${variant_id}`);
    await get().fetchCart();
  },

  clearCart: async () => {
    const { user, isLoggingOut } = useAuthStore.getState();
    if (!user || isLoggingOut) throw new Error("Not logged in");

    await axios.delete("/api/cart/clear");
    await get().fetchCart();
  },

  toggleSelect: (variant_id) => {
    set((prev) => ({
      selected: {
        ...prev.selected,
        [variant_id]: !prev.selected[variant_id],
      },
    }));
  },

  selectAll: () => {
    const map = get().itemsByVariantId;
    const next: Record<string, boolean> = {};
    for (const vid of Object.keys(map)) next[vid] = true;
    set({ selected: next });
  },

  unselectAll: () => {
    set({ selected: {} });
  },

  refreshSummary: async () => {
    const { user, isLoggingOut } = useAuthStore.getState();
    if (!user || isLoggingOut) return;

    const selected = get().selected || {};
    const variant_ids = Object.keys(selected).filter((k) => selected[k]);

    if (variant_ids.length === 0) {
      set({ summary: { total_price: 0, invalid_items: [] } });
      return;
    }

    set({ summaryLoading: true });
    try {
      const res = await axios.post("/api/cart/summary", { variant_ids });
      const payload = res.data?.data ?? res.data;
      set({ summary: payload as CartSummary });
    } finally {
      set({ summaryLoading: false });
    }
  },
}));
