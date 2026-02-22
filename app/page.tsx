// app/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "@/utils/axios";
import ProductCard from "@/components/catalog/ProductCard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import { handleApiError } from "@/utils/handleApiError";
import { usePathname, useRouter } from "next/navigation";
import Portal from "@/components/ui/portal";

type UUID = string;

type VariantGroup = {
  variant_id: UUID;
  color: string;
  size: string;
  retail_price: number;
  retail_discount?: number | null;
  retail_discount_type?: string | null;
  has_retail_discount: boolean;

  wholesale_enabled: boolean;
  wholesale_price?: number | null;
  wholesale_min_qty?: number | null;
  wholesale_discount?: number | null;
  wholesale_discount_type?: string | null;

  weight_grams: number;
  relevance_score?: number | null;
};

type ProductGroup = {
  product_id: UUID;
  product_title: string;
  product_description: string;
  product_images: string[];
  product_promo_video_url?: string;

  seller_id: UUID;
  seller_store_name: string;
  category_id: UUID;
  category_name: string;

  variants: VariantGroup[];
};

type FeedQueryResult = {
  page: number;
  per_page: number;
  total_items: number;
  products: ProductGroup[];
};

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type CategoryNode = {
  id: UUID;
  name: string;
  slug: string;
  level: number;
  is_leaf: boolean;
  children: CategoryNode[];
};

type SortKey = "newest" | "most_viewed" | "price_asc" | "price_desc" | "relevance";

function safeInt(v: string): number | undefined {
  if (v.trim() === "") return undefined;
  const n = Number(v);
  if (!Number.isFinite(n)) return undefined;
  return Math.trunc(n);
}
function safePositiveInt(v: string): number | undefined {
  const n = safeInt(v);
  if (n === undefined) return undefined;
  if (n <= 0) return undefined;
  return n;
}
function compactRecord(obj: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (v === undefined || v === null || v === "") continue;
    out[k] = v;
  }
  return out;
}

function CategoryPicker({
  categories,
  value,
  onSelectLeaf,
  onClear,
  disabled,
}: {
  categories: CategoryNode[];
  value: { id: UUID; name: string } | null;
  onSelectLeaf: (leaf: CategoryNode) => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hoverPath, setHoverPath] = useState<CategoryNode[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const columns: CategoryNode[][] = useMemo(() => {
    const cols: CategoryNode[][] = [];
    cols.push(categories);
    for (let i = 0; i < hoverPath.length; i++) {
      const n = hoverPath[i];
      if (n.children && n.children.length) cols.push(n.children);
    }
    return cols;
  }, [categories, hoverPath]);

  const handleHover = (level: number, node: CategoryNode) => {
    setHoverPath((prev) => {
      const next = prev.slice(0, level);
      next[level] = node;
      return next;
    });
  };

  const handlePick = (node: CategoryNode) => {
    if (!node.is_leaf) return;
    onSelectLeaf(node);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex w-full items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((v) => !v)}
          className={[
            "w-full rounded-xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2 text-left text-sm",
            disabled ? "opacity-60 cursor-not-allowed" : "hover:border-black/20",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate">{value ? value.name : "Select a category (leaf)"}</span>
            {/* <span className="text-[rgb(var(--muted))]">{open ? "▲" : "▼"}</span> */}
          </div>
        </button>

        {value ? (
          <button
            type="button"
            onClick={() => {
              onClear();
              setHoverPath([]);
              setOpen(false);
            }}
            className="shrink-0 rounded-xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2 text-sm hover:border-black/20"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* ✅ The dropdown MUST escape stacking contexts → Portal */}
      {open ? (
        <Portal>
          {/* ✅ “pointer-events-none” wrapper so only the panel catches clicks */}
          <div className="fixed inset-0 z-[1000000] pointer-events-none">
            {/* anchor panel near the button */}
            <div
              className="pointer-events-auto"
              style={{
                position: "absolute",
                left: containerRef.current
                  ? Math.min(
                      containerRef.current.getBoundingClientRect().left,
                      window.innerWidth - 740,
                    )
                  : 0,
                top: containerRef.current
                  ? containerRef.current.getBoundingClientRect().bottom + 8
                  : 0,
                width: "min(720px, 92vw)",
              }}
            >
              <div className="rounded-2xl border border-black/10 bg-[rgb(var(--surface))] shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="flex w-max">
                    {columns.map((col, level) => (
                      <div
                        key={level}
                        className="w-[220px] sm:w-[240px] border-r border-black/10 last:border-r-0"
                      >
                        <div className="max-h-[320px] overflow-auto p-2">
                          {col.map((node) => {
                            const active = hoverPath[level]?.id === node.id;
                            return (
                              <button
                                type="button"
                                key={node.id}
                                onMouseEnter={() => handleHover(level, node)}
                                onClick={() => handlePick(node)}
                                className={[
                                  "w-full rounded-xl px-3 py-2 text-left text-sm",
                                  active ? "bg-black/5" : "hover:bg-black/5",
                                ].join(" ")}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className="truncate">{node.name}</span>
                                  {/* {node.is_leaf ? (
                                    <span className="text-xs text-[rgb(var(--muted))]">Leaf</span>
                                  ) : node.children?.length ? (
                                    <span className="text-xs text-[rgb(var(--muted))]"></span>
                                  ) : (
                                    <span className="text-xs text-[rgb(var(--muted))]">—</span>
                                  )} */}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-black/10 p-3 text-xs text-[rgb(var(--muted))]">
                  Only leaf categories can be selected (matches backend expectation for color/size filtering).
                </div>
              </div>
            </div>
          </div>
        </Portal>
      ) : null}
    </div>
  );
}

export default function Home() {
  const { user } = useAuthStore();
  const cart = useCartStore();

  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<ProductGroup[]>([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(12);

  // search / sort
  const [qInput, setQInput] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  // filters
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [category, setCategory] = useState<{ id: UUID; name: string } | null>(null);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minWeight, setMinWeight] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  // ✅ simplified checkbox filters (checked=true, unchecked=no filter)
  const [inStockOnly, setInStockOnly] = useState(false);
  const [hasRetailDiscountOnly, setHasRetailDiscountOnly] = useState(false);
  const [onlyWholesale, setOnlyWholesale] = useState(false);

  // color/size (disabled until category selected)
  const [color, setColor] = useState("");
  const [size, setSize] = useState("");
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  // cart hydration
  useEffect(() => {
    if (user && !cart.hydrated && !cart.loading) cart.fetchCart().catch(() => {});
    if (!user && cart.hydrated) cart.clearLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // load category tree once
  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get<ApiEnvelope<CategoryNode[]>>("/api/categories/tree");
        const data = (res.data as any)?.data ?? (res.data as any);
        setCategoryTree(Array.isArray(data) ? data : []);
      } catch (e) {
        handleApiError(e);
      }
    };
    run();
  }, []);

  // read URL state on first load
  const didHydrateFromUrl = useRef(false);
  useEffect(() => {
    if (didHydrateFromUrl.current) return;
    didHydrateFromUrl.current = true;

    const sp = new URLSearchParams(window.location.search);

    const q = sp.get("q") ?? "";
    setQInput(q);

    const s = (sp.get("sort") ?? "newest") as SortKey;
    setSort(["newest", "most_viewed", "price_asc", "price_desc", "relevance"].includes(s) ? s : "newest");

    const p = safePositiveInt(sp.get("page") ?? "");
    const pp = safePositiveInt(sp.get("per_page") ?? "");
    if (p) setPage(p);
    if (pp) setPerPage(pp);

    const catId = sp.get("category_id");
    const catName = sp.get("category_name");
    if (catId && catName) setCategory({ id: catId, name: catName });

    setMinPrice(sp.get("min_price") ?? "");
    setMaxPrice(sp.get("max_price") ?? "");
    setMinWeight(sp.get("min_weight") ?? "");
    setMaxWeight(sp.get("max_weight") ?? "");

    setInStockOnly(sp.get("in_stock") === "true");
    setHasRetailDiscountOnly(sp.get("has_retail_discount") === "true");
    setOnlyWholesale(sp.get("only_wholesale") === "true");

    setColor(sp.get("color") ?? "");
    setSize(sp.get("size") ?? "");
  }, []);

  // debounce q
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(qInput.trim()), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  // enforce backend rule: color/size only allowed with category_id
  useEffect(() => {
    if (!category?.id) {
      if (color) setColor("");
      if (size) setSize("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id]);

  // update URL when state changes
  useEffect(() => {
    if (!didHydrateFromUrl.current) return;

    const params = compactRecord({
      page: String(page),
      per_page: String(perPage),

      q: debouncedQ || undefined,
      sort: sort !== "newest" ? sort : undefined,

      category_id: category?.id,
      category_name: category?.name,

      min_price: minPrice || undefined,
      max_price: maxPrice || undefined,
      min_weight: minWeight || undefined,
      max_weight: maxWeight || undefined,

      in_stock: inStockOnly ? "true" : undefined,
      has_retail_discount: hasRetailDiscountOnly ? "true" : undefined,
      only_wholesale: onlyWholesale ? "true" : undefined,

      color: category?.id ? color || undefined : undefined,
      size: category?.id ? size || undefined : undefined,
    });

    const sp = new URLSearchParams(params as any).toString();
    router.replace(sp ? `${pathname}?${sp}` : pathname, { scroll: false });
  }, [
    page,
    perPage,
    debouncedQ,
    sort,
    category?.id,
    category?.name,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    inStockOnly,
    hasRetailDiscountOnly,
    onlyWholesale,
    color,
    size,
    pathname,
    router,
  ]);

  const onFilterChangeResetPage = () => setPage(1);

  // build params exactly per backend contract
  const requestParams = useMemo(() => {
    const params: Record<string, any> = {
      page,
      per_page: perPage,
    };

    if (category?.id) params.category_id = category.id;

    const minP = safeInt(minPrice);
    const maxP = safeInt(maxPrice);
    const minW = safeInt(minWeight);
    const maxW = safeInt(maxWeight);

    if (minP !== undefined) params.min_price = minP;
    if (maxP !== undefined) params.max_price = maxP;
    if (minW !== undefined) params.min_weight = minW;
    if (maxW !== undefined) params.max_weight = maxW;

    if (inStockOnly) params.in_stock = "true";
    if (hasRetailDiscountOnly) params.has_retail_discount = "true";
    if (onlyWholesale) params.only_wholesale = "true";

    if (sort) params.sort = sort;

    if (category?.id) {
      if (color.trim()) params.color = color.trim();
      if (size.trim()) params.size = size.trim();
    }

    if (debouncedQ) params.q = debouncedQ;

    return params;
  }, [
    page,
    perPage,
    category?.id,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    inStockOnly,
    hasRetailDiscountOnly,
    onlyWholesale,
    sort,
    color,
    size,
    debouncedQ,
  ]);

  // fetch feed/search whenever params change
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const endpoint = debouncedQ ? "/api/search" : "/api/feed";
        const res = await axios.get<ApiEnvelope<FeedQueryResult>>(endpoint, { params: requestParams });

        const data: FeedQueryResult = (res.data as any)?.data?.products
          ? (res.data as any).data
          : ((res.data as any) ?? { products: [] });

        const items = data?.products ?? [];
        setProducts(items);

        const cset = new Set<string>();
        const sset = new Set<string>();
        for (const p of items) {
          for (const v of p.variants || []) {
            if (v.color) cset.add(v.color);
            if (v.size) sset.add(v.size);
          }
        }
        setAvailableColors(Array.from(cset).sort((a, b) => a.localeCompare(b)));
        setAvailableSizes(Array.from(sset).sort((a, b) => a.localeCompare(b)));
      } catch (e) {
        handleApiError(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [requestParams, debouncedQ]);

  const resetAll = () => {
    setPage(1);
    setPerPage(12);

    setQInput("");
    setSort("newest");

    setCategory(null);

    setMinPrice("");
    setMaxPrice("");
    setMinWeight("");
    setMaxWeight("");

    setInStockOnly(false);
    setHasRetailDiscountOnly(false);
    setOnlyWholesale(false);

    setColor("");
    setSize("");
  };

  const categorySelectedFromTree = (leaf: CategoryNode) => {
    setCategory({ id: leaf.id, name: leaf.name });
    setColor("");
    setSize("");
    setPage(1);
  };

  const canUseColorSize = Boolean(category?.id);

  return (
    <div className="mx-auto max-w-6xl py-6 px-2 sm:px-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[rgb(var(--text))] tracking-tight">
            Explore leather essentials
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Handcrafted pieces from trusted sellers — bags, wallets, belts, and more.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:flex-1">
          <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2">
            <span className="text-[rgb(var(--muted))]">🔎</span>
            <input
              value={qInput}
              onChange={(e) => {
                setQInput(e.target.value);
                setPage(1);
              }}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm outline-none text-[rgb(var(--text))]"
            />
            {qInput ? (
              <button
                type="button"
                onClick={() => {
                  setQInput("");
                  setPage(1);
                }}
                className="rounded-lg px-2 py-1 text-xs text-[rgb(var(--muted))] hover:bg-black/5"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 md:w-auto md:justify-end">
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortKey);
              onFilterChangeResetPage();
            }}
            className="w-full sm:w-auto rounded-xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2 text-sm text-[rgb(var(--text))] hover:border-black/20"
          >
            <option value="newest">Newest</option>
            <option value="most_viewed">Most viewed</option>
            <option value="price_asc">Price: low → high</option>
            <option value="price_desc">Price: high → low</option>
            <option value="relevance" disabled={!debouncedQ}>
              Relevance (search only)
            </option>
          </select>

          <button
            type="button"
            onClick={resetAll}
            className="w-full sm:w-auto rounded-xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2 text-sm hover:border-black/20"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ✅ IMPORTANT: explicit stacking layers to stop ProductCard transform from “winning” */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        {/* Filters column: always higher layer */}
        <div className="rounded-2xl border border-black/10 bg-[rgb(var(--surface))] p-4 h-fit relative z-50 lg:sticky lg:top-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-[rgb(var(--text))]">Filters</div>
            <div className="text-xs text-[rgb(var(--muted))]">Auto-refresh</div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-2 text-xs text-[rgb(var(--muted))]">Category</div>
              <CategoryPicker
                categories={categoryTree}
                value={category}
                onSelectLeaf={categorySelectedFromTree}
                onClear={() => {
                  setCategory(null);
                  setPage(1);
                }}
                disabled={categoryTree.length === 0}
              />
              {categoryTree.length === 0 ? (
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">Category tree not loaded yet.</div>
              ) : null}
            </div>

            <div>
              <div className="mb-2 text-xs text-[rgb(var(--muted))]">Price (BDT)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    onFilterChangeResetPage();
                  }}
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none hover:border-black/20"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    onFilterChangeResetPage();
                  }}
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none hover:border-black/20"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs text-[rgb(var(--muted))]">Weight (grams)</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={minWeight}
                  onChange={(e) => {
                    setMinWeight(e.target.value);
                    onFilterChangeResetPage();
                  }}
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none hover:border-black/20"
                />
                <input
                  value={maxWeight}
                  onChange={(e) => {
                    setMaxWeight(e.target.value);
                    onFilterChangeResetPage();
                  }}
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none hover:border-black/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-black/20">
                <span>In stock only</span>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    onFilterChangeResetPage();
                  }}
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-black/20">
                <span>Has retail discount</span>
                <input
                  type="checkbox"
                  checked={hasRetailDiscountOnly}
                  onChange={(e) => {
                    setHasRetailDiscountOnly(e.target.checked);
                    onFilterChangeResetPage();
                  }}
                />
              </label>

              <label className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-black/20">
                <span>Only wholesale</span>
                <input
                  type="checkbox"
                  checked={onlyWholesale}
                  onChange={(e) => {
                    setOnlyWholesale(e.target.checked);
                    onFilterChangeResetPage();
                  }}
                />
              </label>
            </div>

            <div>
              <div className="mb-2 text-xs text-[rgb(var(--muted))]">Variant filters</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  disabled={!canUseColorSize}
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    onFilterChangeResetPage();
                  }}
                  className={[
                    "w-full rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-black/20",
                    !canUseColorSize ? "opacity-60 cursor-not-allowed bg-black/5" : "bg-[rgb(var(--surface))]",
                  ].join(" ")}
                >
                  <option value="">Color</option>
                  {availableColors.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  disabled={!canUseColorSize}
                  value={size}
                  onChange={(e) => {
                    setSize(e.target.value);
                    onFilterChangeResetPage();
                  }}
                  className={[
                    "w-full rounded-xl border border-black/10 px-3 py-2 text-sm hover:border-black/20",
                    !canUseColorSize ? "opacity-60 cursor-not-allowed bg-black/5" : "bg-[rgb(var(--surface))]",
                  ].join(" ")}
                >
                  <option value="">Size</option>
                  {availableSizes.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {!canUseColorSize ? (
                <div className="mt-2 text-xs text-[rgb(var(--muted))]">
                  Select a leaf category to enable color/size (backend requirement).
                </div>
              ) : null}
            </div>

            <div className="text-xs text-[rgb(var(--muted))]">
              Note: colors/sizes are currently derived from the last response page. For full accuracy, add a category
              facets endpoint.
            </div>
          </div>
        </div>

        {/* Products column: explicitly lower layer */}
        <div className="relative z-0">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-[rgb(var(--muted))]">{loading ? "Loading…" : `${products.length} products`}</div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-full sm:w-auto rounded-xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2 text-sm hover:border-black/20 disabled:opacity-60"
              >
                Prev
              </button>
              <div className="text-sm text-[rgb(var(--muted))]">Page {page}</div>
              <button
                type="button"
                disabled={loading}
                onClick={() => setPage((p) => p + 1)}
                className="w-full sm:w-auto rounded-xl border border-black/10 bg-[rgb(var(--surface))] px-3 py-2 text-sm hover:border-black/20 disabled:opacity-60"
              >
                Next
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-black/10 bg-[rgb(var(--surface))] overflow-hidden">
                  <div className="aspect-[4/3] bg-black/5 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 w-3/4 bg-black/10 rounded animate-pulse" />
                    <div className="h-9 w-full bg-black/10 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          )}

          {!loading && products.length === 0 ? (
            <div className="mt-5 text-sm text-[rgb(var(--muted))]">No products returned from {debouncedQ ? "search" : "feed"}.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}