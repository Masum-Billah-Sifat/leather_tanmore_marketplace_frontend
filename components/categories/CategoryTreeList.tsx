"use client";

import type { CategoryNode } from "./types";

export default function CategoryTreeList({
  nodes,
  onSelect,
  depth = 0,
}: {
  nodes: CategoryNode[];
  onSelect: (node: CategoryNode) => void;
  depth?: number;
}) {
  if (!nodes?.length) return null;

  return (
    <div className="space-y-1">
      {nodes.map((n) => (
        <div key={n.id}>
          <button
            type="button"
            onClick={() => onSelect(n)}
            className="w-full text-left rounded-lg px-2 py-1.5 text-sm hover:bg-gray-50 flex items-center justify-between"
            style={{ paddingLeft: 8 + depth * 12 }}
          >
            <span className="text-gray-900">{n.name}</span>
            {!n.is_leaf && n.children?.length ? (
              <span className="text-xs text-gray-400">›</span>
            ) : null}
          </button>

          {!n.is_leaf && n.children?.length ? (
            <CategoryTreeList nodes={n.children} onSelect={onSelect} depth={depth + 1} />
          ) : null}
        </div>
      ))}
    </div>
  );
}
