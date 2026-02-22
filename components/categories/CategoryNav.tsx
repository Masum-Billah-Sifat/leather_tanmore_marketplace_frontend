// components/categories/CategoryNav.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { handleApiError } from "@/utils/handleApiError";
import { fetchCategoryTree } from "./api";
import type { CategoryNode } from "./types";
import CategoryMegaMenu from "./CategoryMegaMenu";

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 10l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CategoryNav() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string>("");

  const closeTimer = useRef<any>(null);

  const [scrolled, setScrolled] = useState(false);

  // ✅ NEW: refs + positioning state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [anchorX, setAnchorX] = useState(0); // center x (px) inside container
  const [containerW, setContainerW] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ NEW: keep container width updated for clamping
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setContainerW(el.clientWidth);
    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const t = await fetchCategoryTree();
        setTree(Array.isArray(t) ? t : []);
      } catch (e) {
        handleApiError(e);
        setTree([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const topLevel = useMemo(() => {
    if (!tree?.length) return [];
    const lvl0 = tree.filter((x) => x.level === 0);
    return lvl0.length ? lvl0 : tree;
  }, [tree]);

  const activeRoot = useMemo(() => {
    if (!open) return null;
    return topLevel.find((x) => x.id === activeId) ?? null;
  }, [open, activeId, topLevel]);

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  const onSelect = (node: CategoryNode) => {
    setOpen(false);
    router.push(`/category/${node.id}`);
  };

  // ✅ UPDATED: openRoot now also sets anchorX based on hovered chip
  const openRoot = (id: string, btn?: HTMLButtonElement | null) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveId(id);
    setOpen(true);

    const container = containerRef.current;
    const el = btn ?? chipRefs.current[id];
    if (!container || !el) return;

    const c = container.getBoundingClientRect();
    const b = el.getBoundingClientRect();
    const x = b.left - c.left + b.width / 2; // center-x inside container
    setAnchorX(x);
  };

  // Breakpoint-based visibility:
  const chipVisibilityClass = (idx: number) => {
    if (idx <= 2) return "";
    if (idx === 3) return "hidden sm:inline-flex";
    if (idx === 4 || idx === 5) return "hidden lg:inline-flex";
    if (idx === 6) return "hidden xl:inline-flex";
    return "hidden";
  };

  return (
    <div
      className={[
        "sticky top-16 z-40 w-full border-b transition",
        scrolled
          ? "border-black/10 bg-[rgb(var(--surface))] shadow-sm"
          : "border-black/5 bg-[rgb(var(--surface))]/70 backdrop-blur supports-[backdrop-filter]:bg-[rgb(var(--surface))]/60",
      ].join(" ")}
    >
      <div
        ref={containerRef} // ✅ NEW
        className="mx-auto max-w-7xl px-6 relative"
        onMouseLeave={scheduleClose}
        onMouseEnter={() => {
          if (closeTimer.current) clearTimeout(closeTimer.current);
        }}
      >
        <div className="h-14 flex items-center">
          <div className="w-full">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 justify-start sm:justify-center">
              {topLevel.map((c, idx) => (
                <button
                  key={c.id}
                  ref={(el) => {
                    chipRefs.current[c.id] = el; // ✅ NEW
                  }}
                  type="button"
                  onMouseEnter={(e) => openRoot(c.id, e.currentTarget)}
                  onFocus={(e) => openRoot(c.id, e.currentTarget as HTMLButtonElement)}
                  onClick={() => onSelect(c)}
                  className={[
                    chipVisibilityClass(idx),
                    "group inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition",
                    activeId === c.id && open
                      ? "bg-[rgb(var(--brand))]/10 text-[rgb(var(--brand-strong))] border-[rgb(var(--brand))]/30"
                      : "bg-[rgb(var(--surface))] text-[rgb(var(--text))] border-black/10 hover:bg-black/5",
                  ].join(" ")}
                >
                  <span>{c.name}</span>
                  <span
                    className={[
                      "transition",
                      activeId === c.id && open
                        ? "text-[rgb(var(--brand-strong))]"
                        : "text-[rgb(var(--muted))] group-hover:text-[rgb(var(--text))]",
                    ].join(" ")}
                  >
                    <ChevronDown />
                  </span>
                </button>
              ))}

              {loading ? (
                <div className="text-xs text-[rgb(var(--muted))] px-2">Loading…</div>
              ) : null}

              {!loading && topLevel.length === 0 ? (
                <div className="text-sm text-[rgb(var(--muted))]">No categories.</div>
              ) : null}
            </div>
          </div>
        </div>

        <div
          onMouseEnter={() => {
            if (closeTimer.current) clearTimeout(closeTimer.current);
          }}
          onMouseLeave={scheduleClose}
        >
          {open ? (
            <CategoryMegaMenu
              activeRoot={activeRoot}
              onSelect={onSelect}
              anchorX={anchorX}          // ✅ NEW
              containerWidth={containerW} // ✅ NEW
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
