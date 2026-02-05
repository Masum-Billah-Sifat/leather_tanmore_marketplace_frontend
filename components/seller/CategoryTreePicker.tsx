"use client";

import { useMemo, useState } from "react";

export type CategoryNode = {
  id: string;
  name: string;
  slug?: string;
  level?: number;
  is_leaf: boolean;
  children: CategoryNode[];
};

type Props = {
  categories: CategoryNode[];
  selectedId: string | null;
  onSelectLeaf: (leaf: CategoryNode) => void;
};

export default function CategoryTreePicker({ categories, selectedId, onSelectLeaf }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  const renderNode = (node: CategoryNode) => {
    const isOpen = !!expanded[node.id];
    const isSelected = selectedId === node.id;

    const hasChildren = !!node.children?.length;
    const canSelect = node.is_leaf;

    return (
      <div key={node.id} className="select-none">
        <div className="flex items-center gap-2 py-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggle(node.id)}
              className="h-6 w-6 rounded-md border text-xs text-gray-700 hover:bg-gray-50"
              aria-label={isOpen ? "Collapse" : "Expand"}
            >
              {isOpen ? "–" : "+"}
            </button>
          ) : (
            <span className="h-6 w-6" />
          )}

          <button
            type="button"
            onClick={() => {
              if (canSelect) onSelectLeaf(node);
              else toggle(node.id);
            }}
            className={[
              "flex-1 text-left rounded-lg px-2 py-1 text-sm",
              canSelect ? "hover:bg-gray-50" : "hover:bg-gray-50",
              isSelected ? "bg-black text-white hover:bg-black" : "text-gray-800",
            ].join(" ")}
            title={canSelect ? "Leaf category (selectable)" : "Not a leaf (expand)"}
          >
            <span className="font-medium">{node.name}</span>
            {!node.is_leaf ? (
              <span className={`ml-2 text-xs ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                (group)
              </span>
            ) : (
              <span className={`ml-2 text-xs ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                (leaf)
              </span>
            )}
          </button>
        </div>

        {hasChildren && isOpen ? (
          <div className="ml-8 border-l pl-3">
            {node.children.map(renderNode)}
          </div>
        ) : null}
      </div>
    );
  };

  const empty = useMemo(() => !categories || categories.length === 0, [categories]);

  if (empty) {
    return <p className="text-sm text-gray-500">No categories found.</p>;
  }

  return <div className="space-y-1">{categories.map(renderNode)}</div>;
}
