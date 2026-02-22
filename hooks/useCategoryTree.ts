"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { unwrapData } from "@/utils/unWrapData";
import { handleApiError } from "@/utils/handleApiError";
import type { CategoryNode } from "@/types/category";

type PathInfo = {
  ids: string[];
  names: string[];
};

function walkTree(
  nodes: CategoryNode[],
  parentPath: PathInfo,
  parentMap: Map<string, string | null>,
  pathMap: Map<string, PathInfo>,
  leafIds: Set<string>
) {
  for (const n of nodes || []) {
    parentMap.set(n.id, parentPath.ids.length ? parentPath.ids[parentPath.ids.length - 1] : null);

    const nextPath: PathInfo = {
      ids: [...parentPath.ids, n.id],
      names: [...parentPath.names, n.name],
    };
    pathMap.set(n.id, nextPath);

    if (n.is_leaf) leafIds.add(n.id);
    if (n.children?.length) {
      walkTree(n.children, nextPath, parentMap, pathMap, leafIds);
    }
  }
}

export function useCategoryTree() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get("/api/categories/tree");
        const data = unwrapData<CategoryNode[]>(res);
        if (mounted) setTree(data || []);
      } catch (err: any) {
        handleApiError(err);
        if (mounted) {
          setTree([]);
          setError(err?.message || "Failed to load category tree");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const helpers = useMemo(() => {
    const parentMap = new Map<string, string | null>();
    const pathMap = new Map<string, PathInfo>();
    const leafIds = new Set<string>();

    walkTree(tree, { ids: [], names: [] }, parentMap, pathMap, leafIds);

    return { parentMap, pathMap, leafIds };
  }, [tree]);

  return { tree, loading, error, ...helpers };
}