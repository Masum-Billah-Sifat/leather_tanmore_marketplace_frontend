"use client";

import { useMemo, useState } from "react";
import type { CategoryNode } from "@/types/category";
import { useCategoryTree } from "@/hooks/useCategoryTree";
import { updateProductCategory } from "@/api/sellerProductApi";
import { handleApiError } from "@/utils/handleApiError";

function TreeNode({
  node,
  expanded,
  toggleExpanded,
  selectedId,
  onSelectLeaf,
  searchLower,
}: {
  node: CategoryNode;
  expanded: Set<string>;
  toggleExpanded: (id: string) => void;
  selectedId: string | null;
  onSelectLeaf: (leafId: string) => void;
  searchLower: string;
}) {
  const hasChildren = (node.children?.length || 0) > 0;
  const isExpanded = expanded.has(node.id);

  // simple name-only filter; if search is set, show nodes that match or have matching descendants
  const matches = !searchLower || node.name.toLowerCase().includes(searchLower);
  const childMatches =
    !searchLower ||
    (node.children || []).some((c) => c.name.toLowerCase().includes(searchLower)); // lightweight

  const showNode = matches || childMatches || !searchLower;

  if (!showNode) return null;

  return (
    <div className="select-none">
      <div className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-gray-50">
        {hasChildren ? (
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg border bg-white text-sm"
            onClick={() => toggleExpanded(node.id)}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "–" : "+"}
          </button>
        ) : (
          <div className="h-7 w-7" />
        )}

        {node.is_leaf ? (
          <button
            type="button"
            onClick={() => onSelectLeaf(node.id)}
            className={`flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-2 py-1 text-left ${
              selectedId === node.id ? "bg-black text-white" : "bg-transparent text-gray-900"
            }`}
          >
            <span className="truncate text-sm font-medium">{node.name}</span>
            <span className={`text-xs ${selectedId === node.id ? "text-white/80" : "text-gray-400"}`}>Leaf</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => toggleExpanded(node.id)}
            className="min-w-0 flex-1 rounded-lg px-2 py-1 text-left"
          >
            <span className="truncate text-sm font-medium text-gray-900">{node.name}</span>
          </button>
        )}
      </div>

      {hasChildren && isExpanded ? (
        <div className="ml-6 border-l pl-3">
          {(node.children || []).map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              expanded={expanded}
              toggleExpanded={toggleExpanded}
              selectedId={selectedId}
              onSelectLeaf={onSelectLeaf}
              searchLower={searchLower}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CategoryPickerCard({
  productId,
  currentCategoryId,
  currentCategoryName,
  onUpdated,
}: {
  productId: string;
  currentCategoryId: string | null | undefined;
  currentCategoryName: string | null | undefined;
  onUpdated: () => Promise<void>;
}) {
  const { tree, loading, error, pathMap, leafIds } = useCategoryTree();

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(currentCategoryId || null);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const searchLower = search.trim().toLowerCase();

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSelectLeaf(id: string) {
    if (!leafIds.has(id)) return;
    setSelectedId(id);
  }

  const selectedPath = useMemo(() => {
    if (!selectedId) return null;
    return pathMap.get(selectedId) || null;
  }, [selectedId, pathMap]);

  const canSave = !!selectedId && selectedId !== (currentCategoryId || null) && leafIds.has(selectedId);

  async function save() {
    if (!selectedId) return;
    if (!leafIds.has(selectedId)) return;

    setSaving(true);
    try {
      await updateProductCategory(productId, selectedId);
      await onUpdated(); // refresh product detail (updates category_id + name on your detail endpoint)
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Category</p>
          <p className="mt-1 text-sm text-gray-600">
            Current:{" "}
            <span className="font-medium text-gray-900">
              {currentCategoryName || "Not set"}
            </span>
          </p>

          {selectedPath ? (
            <p className="mt-1 truncate text-xs text-gray-500">
              Selected path: {selectedPath.names.join(" > ")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
            onClick={() => setSelectedId(currentCategoryId || null)}
            disabled={saving}
          >
            Reset
          </button>

          <button
            type="button"
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            onClick={save}
            disabled={!canSave || saving}
          >
            {saving ? "Saving..." : "Save category"}
          </button>
        </div>
      </div>

      <div className="mt-4">
        <input
          className="w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/20"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="rounded-2xl border bg-gray-50 p-4">
            <p className="text-sm text-gray-600">Loading category tree…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border bg-gray-50 p-4">
            <p className="text-sm font-medium text-gray-900">Could not load categories</p>
            <p className="mt-1 text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto rounded-2xl border bg-white p-2">
            {(tree || []).map((root) => (
              <TreeNode
                key={root.id}
                node={root}
                expanded={expanded}
                toggleExpanded={toggleExpanded}
                selectedId={selectedId}
                onSelectLeaf={onSelectLeaf}
                searchLower={searchLower}
              />
            ))}
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-gray-500">
        Only leaf nodes can be selected. Non-leaf nodes are just folders.
      </p>
    </div>
  );
}