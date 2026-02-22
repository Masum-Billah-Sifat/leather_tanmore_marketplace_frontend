// // components/categories/CategoryMegaMenu.tsx
// "use client";

// import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
// import type { CategoryNode } from "./types";

// function pickFirst(nodes?: CategoryNode[]) {
//   return nodes && nodes.length ? nodes[0] : null;
// }

// function Column({
//   nodes,
//   activeId,
//   onHover,
//   onPick,
// }: {
//   nodes: CategoryNode[];
//   activeId: string;
//   onHover: (id: string) => void;
//   onPick: (node: CategoryNode) => void;
// }) {
//   if (!nodes?.length) return null;

//   return (
//     <div className="w-56 lg:w-60">
//       <div className="p-2">
//         <ul className="space-y-1">
//           {nodes.map((n) => {
//             const active = n.id === activeId;

//             return (
//               <li key={n.id}>
//                 <button
//                   type="button"
//                   onMouseEnter={() => onHover(n.id)}
//                   onFocus={() => onHover(n.id)}
//                   onClick={() => onPick(n)}
//                   className={[
//                     "w-full text-left rounded-xl px-3 py-2 text-sm transition",
//                     "flex items-center justify-between",
//                     active
//                       ? "bg-[rgb(var(--brand))]/10 text-[rgb(var(--brand-strong))]"
//                       : "text-[rgb(var(--text))] hover:bg-black/5",
//                   ].join(" ")}
//                 >
//                   <span className="truncate">{n.name}</span>
//                   {!n.is_leaf && n.children?.length ? (
//                     <span
//                       className={
//                         active
//                           ? "text-[rgb(var(--brand-strong))]/70"
//                           : "text-[rgb(var(--muted))]"
//                       }
//                     >
//                       ›
//                     </span>
//                   ) : null}
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       </div>
//     </div>
//   );
// }

// export default function CategoryMegaMenu({
//   activeRoot,
//   onSelect,
//   anchorX,
//   containerWidth,
// }: {
//   activeRoot: CategoryNode | null;
//   onSelect: (node: CategoryNode) => void;
//   anchorX: number;          // ✅ NEW
//   containerWidth: number;   // ✅ NEW
// }) {
//   const level1 = activeRoot?.children ?? [];

//   const [l1Id, setL1Id] = useState("");
//   const [l2Id, setL2Id] = useState("");

//   // ✅ NEW: measure menu width and clamp left
//   const menuRef = useRef<HTMLDivElement | null>(null);
//   const [leftPx, setLeftPx] = useState(12);

//   useEffect(() => {
//     const first1 = pickFirst(level1);
//     setL1Id(first1?.id ?? "");
//     const first2 = pickFirst(first1?.children ?? []);
//     setL2Id(first2?.id ?? "");
//   }, [activeRoot?.id]);

//   const activeL1 = useMemo(() => level1.find((x) => x.id === l1Id) ?? null, [level1, l1Id]);
//   const level2 = activeL1?.children ?? [];

//   useEffect(() => {
//     const first2 = pickFirst(level2);
//     setL2Id(first2?.id ?? "");
//   }, [l1Id]);

//   const activeL2 = useMemo(() => level2.find((x) => x.id === l2Id) ?? null, [level2, l2Id]);
//   const level3 = activeL2?.children ?? [];

//   if (!activeRoot) return null;

//   const showL1 = level1.length > 0;
//   const showL2 = level2.length > 0;
//   const showL3 = level3.length > 0;

//   if (!showL1) return null;

//   // ✅ compute left after render (so we know menu width)
//   useLayoutEffect(() => {
//     const el = menuRef.current;
//     if (!el) return;

//     const w = el.offsetWidth || 0;
//     const pad = 12;

//     // center under hovered chip
//     const ideal = anchorX - w / 2;

//     // clamp inside container
//     const maxLeft = Math.max(pad, (containerWidth || 0) - w - pad);
//     const clamped = Math.max(pad, Math.min(ideal, maxLeft));

//     setLeftPx(clamped);
//   }, [
//     anchorX,
//     containerWidth,
//     activeRoot?.id,
//     l1Id,
//     l2Id,
//     showL2,
//     showL3,
//   ]);

//   return (
//     <div className="absolute top-full z-50" style={{ left: leftPx }}>
//       <div
//         ref={menuRef}
//         className="mt-3 rounded-2xl border border-black/10 bg-[rgb(var(--surface))] shadow-lg overflow-hidden"
//       >
//         <div className="flex items-start">
//           {showL1 ? (
//             <div className={showL2 || showL3 ? "border-r border-black/5" : ""}>
//               <Column nodes={level1} activeId={l1Id} onHover={(id) => setL1Id(id)} onPick={onSelect} />
//             </div>
//           ) : null}

//           {showL2 ? (
//             <div className={showL3 ? "border-r border-black/5" : ""}>
//               <Column nodes={level2} activeId={l2Id} onHover={(id) => setL2Id(id)} onPick={onSelect} />
//             </div>
//           ) : null}

//           {showL3 ? (
//             <div>
//               <Column nodes={level3} activeId={"__none__"} onHover={() => {}} onPick={onSelect} />
//             </div>
//           ) : null}
//         </div>
//       </div>
//     </div>
//   );
// }


// components/categories/CategoryMegaMenu.tsx
"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CategoryNode } from "./types";

function pickFirst(nodes?: CategoryNode[]) {
  return nodes && nodes.length ? nodes[0] : null;
}

function Column({
  nodes,
  activeId,
  onHover,
  onPick,
}: {
  nodes: CategoryNode[];
  activeId: string;
  onHover: (id: string) => void;
  onPick: (node: CategoryNode) => void;
}) {
  if (!nodes?.length) return null;

  return (
    <div className="w-56 lg:w-60">
      <div className="p-2">
        <ul className="space-y-1">
          {nodes.map((n) => {
            const active = n.id === activeId;

            return (
              <li key={n.id}>
                <button
                  type="button"
                  onMouseEnter={() => onHover(n.id)}
                  onFocus={() => onHover(n.id)}
                  onClick={() => onPick(n)}
                  className={[
                    "w-full text-left rounded-xl px-3 py-2 text-sm transition",
                    "flex items-center justify-between",
                    active
                      ? "bg-[rgb(var(--brand))]/10 text-[rgb(var(--brand-strong))]"
                      : "text-[rgb(var(--text))] hover:bg-black/5",
                  ].join(" ")}
                >
                  <span className="truncate">{n.name}</span>
                  {!n.is_leaf && n.children?.length ? (
                    <span
                      className={
                        active
                          ? "text-[rgb(var(--brand-strong))]/70"
                          : "text-[rgb(var(--muted))]"
                      }
                    >
                      ›
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default function CategoryMegaMenu({
  activeRoot,
  onSelect,
  anchorX,
  containerWidth,
}: {
  activeRoot: CategoryNode | null;
  onSelect: (node: CategoryNode) => void;
  anchorX: number;
  containerWidth: number;
}) {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [leftPx, setLeftPx] = useState(12);

  const [l1Id, setL1Id] = useState("");
  const [l2Id, setL2Id] = useState("");

  // ✅ Make derived arrays stable (no "?? []" that recreates arrays each render)
  const level1 = useMemo<CategoryNode[]>(
    () => activeRoot?.children ?? [],
    [activeRoot],
  );

  const activeL1 = useMemo(
    () => level1.find((x) => x.id === l1Id) ?? null,
    [level1, l1Id],
  );

  const level2 = useMemo<CategoryNode[]>(
    () => activeL1?.children ?? [],
    [activeL1],
  );

  const activeL2 = useMemo(
    () => level2.find((x) => x.id === l2Id) ?? null,
    [level2, l2Id],
  );

  const level3 = useMemo<CategoryNode[]>(
    () => activeL2?.children ?? [],
    [activeL2],
  );

  const showL1 = level1.length > 0;
  const showL2 = level2.length > 0;
  const showL3 = level3.length > 0;

  // ✅ Reset hover path when root changes (dependency: activeRoot, level1)
  useEffect(() => {
    if (!activeRoot) return;

    const first1 = pickFirst(level1);
    setL1Id(first1?.id ?? "");

    const first2 = pickFirst(first1?.children ?? []);
    setL2Id(first2?.id ?? "");
  }, [activeRoot, level1]);

  // ✅ Reset level2 selection when l1 changes (dependency: level2)
  useEffect(() => {
    if (!activeRoot) return;

    const first2 = pickFirst(level2);
    setL2Id(first2?.id ?? "");
  }, [activeRoot, level2]);

  // ✅ Compute left position (must NOT be after early return)
  useLayoutEffect(() => {
    if (!activeRoot) return;

    const el = menuRef.current;
    if (!el) return;

    const w = el.offsetWidth || 0;
    const pad = 12;

    const ideal = anchorX - w / 2;
    const maxLeft = Math.max(pad, (containerWidth || 0) - w - pad);
    const clamped = Math.max(pad, Math.min(ideal, maxLeft));

    setLeftPx(clamped);
  }, [
    activeRoot,
    anchorX,
    containerWidth,
    l1Id,
    l2Id,
    showL2,
    showL3,
  ]);

  // ✅ Now it is safe to return early AFTER hooks
  if (!activeRoot || !showL1) return null;

  return (
    <div className="absolute top-full z-50" style={{ left: leftPx }}>
      <div
        ref={menuRef}
        className="mt-3 rounded-2xl border border-black/10 bg-[rgb(var(--surface))] shadow-lg overflow-hidden"
      >
        <div className="flex items-start">
          <div className={showL2 || showL3 ? "border-r border-black/5" : ""}>
            <Column
              nodes={level1}
              activeId={l1Id}
              onHover={(id) => setL1Id(id)}
              onPick={onSelect}
            />
          </div>

          {showL2 ? (
            <div className={showL3 ? "border-r border-black/5" : ""}>
              <Column
                nodes={level2}
                activeId={l2Id}
                onHover={(id) => setL2Id(id)}
                onPick={onSelect}
              />
            </div>
          ) : null}

          {showL3 ? (
            <div>
              <Column
                nodes={level3}
                activeId={"__none__"}
                onHover={() => {}}
                onPick={onSelect}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
