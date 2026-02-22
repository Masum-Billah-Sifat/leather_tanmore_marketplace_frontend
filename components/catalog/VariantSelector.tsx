// // components/catalog/VariantSelector.tsx
// "use client";

// import { useEffect, useMemo, useState } from "react";

// export type Variant = {
//   variant_id: string;
//   color: string;
//   size: string;
//   retail_price: number;
//   has_retail_discount?: boolean;
//   retail_discount?: number | null;
//   retail_discount_type?: "flat" | "percentage" | null;

//   wholesale_enabled?: boolean;
//   wholesale_price?: number | null;

//   // backend might send either naming; we keep both optional for UI display
//   wholesale_min_quantity?: number | null;
//   wholesale_min_qty?: number | null;

//   wholesale_discount?: number | null;
//   wholesale_discount_type?: "flat" | "percentage" | null;

//   weight_grams: number;
//   in_stock?: boolean;
//   stock_amount?: number;
//   stock_quantity?: number;
// };

// type Props = {
//   variants: Variant[];
//   onChange: (variant: Variant | null) => void;
// };

// export default function VariantSelector({ variants, onChange }: Props) {
//   const colors = useMemo(() => {
//     const s = new Set<string>();
//     variants.forEach((v) => s.add(v.color));
//     return Array.from(s);
//   }, [variants]);

//   const sizes = useMemo(() => {
//     const s = new Set<string>();
//     variants.forEach((v) => s.add(v.size));
//     return Array.from(s);
//   }, [variants]);

//   const [selectedColor, setSelectedColor] = useState<string | null>(null);
//   const [selectedSize, setSelectedSize] = useState<string | null>(null);

//   const matchingVariant = useMemo(() => {
//     if (!selectedColor || !selectedSize) return null;
//     return variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null;
//   }, [variants, selectedColor, selectedSize]);

//   useEffect(() => {
//     onChange(matchingVariant);
//   }, [matchingVariant, onChange]);

//   const sizeEnabled = (size: string) => {
//     if (!selectedColor) return true;
//     return variants.some((v) => v.color === selectedColor && v.size === size);
//   };

//   const colorEnabled = (color: string) => {
//     if (!selectedSize) return true;
//     return variants.some((v) => v.size === selectedSize && v.color === color);
//   };

//   const chipBase =
//     "rounded-full border px-3 py-2 text-sm font-medium transition";
//   const chipActive =
//     "bg-[rgb(var(--brand))]/10 border-[rgb(var(--brand))]/30 text-[rgb(var(--brand-strong))]";
//   const chipIdle =
//     "border-black/10 text-[rgb(var(--text))] hover:bg-black/5";
//   const chipDisabled = "opacity-40 cursor-not-allowed";

//   return (
//     <div className="space-y-4">
//       <div>
//         <div className="text-sm font-semibold text-[rgb(var(--text))]">Color</div>
//         <div className="mt-2 flex flex-wrap gap-2">
//           {colors.map((c) => {
//             const enabled = colorEnabled(c);
//             const active = selectedColor === c;

//             return (
//               <button
//                 key={c}
//                 type="button"
//                 onClick={() => setSelectedColor(active ? null : c)}
//                 disabled={!enabled}
//                 className={[
//                   chipBase,
//                   active ? chipActive : chipIdle,
//                   !enabled ? chipDisabled : "",
//                 ].join(" ")}
//               >
//                 {c}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <div>
//         <div className="text-sm font-semibold text-[rgb(var(--text))]">Size</div>
//         <div className="mt-2 flex flex-wrap gap-2">
//           {sizes.map((s) => {
//             const enabled = sizeEnabled(s);
//             const active = selectedSize === s;

//             return (
//               <button
//                 key={s}
//                 type="button"
//                 onClick={() => setSelectedSize(active ? null : s)}
//                 disabled={!enabled}
//                 className={[
//                   chipBase,
//                   active ? chipActive : chipIdle,
//                   !enabled ? chipDisabled : "",
//                 ].join(" ")}
//               >
//                 {s}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {!selectedColor || !selectedSize ? (
//         <div className="text-sm text-[rgb(var(--muted))]">
//           Select a color and a size to continue.
//         </div>
//       ) : matchingVariant ? (
//         <div className="text-sm text-[rgb(var(--text))]">
//           Selected:{" "}
//           <span className="font-semibold">{matchingVariant.color}</span> /{" "}
//           <span className="font-semibold">{matchingVariant.size}</span>
//         </div>
//       ) : (
//         <div className="text-sm text-red-600">No matching variant found.</div>
//       )}
//     </div>
//   );
// }


// components/catalog/VariantSelector.tsx
"use client";

import { useEffect, useMemo, useState } from "react";

export type Variant = {
  variant_id: string;
  color: string;
  size: string;
  retail_price: number;
  has_retail_discount?: boolean;
  retail_discount?: number | null;
  retail_discount_type?: "flat" | "percentage" | null;

  wholesale_enabled?: boolean;
  wholesale_price?: number | null;

  wholesale_min_quantity?: number | null;
  wholesale_min_qty?: number | null;

  wholesale_discount?: number | null;
  wholesale_discount_type?: "flat" | "percentage" | null;

  weight_grams: number;
  in_stock?: boolean;
  stock_amount?: number;
  stock_quantity?: number;
};

type Props = {
  variants: Variant[];
  onChange: (variant: Variant | null) => void;
};

export default function VariantSelector({ variants, onChange }: Props) {
  const colors = useMemo(() => {
    const s = new Set<string>();
    variants.forEach((v) => s.add(v.color));
    return Array.from(s);
  }, [variants]);

  const sizes = useMemo(() => {
    const s = new Set<string>();
    variants.forEach((v) => s.add(v.size));
    return Array.from(s);
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const matchingVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find((v) => v.color === selectedColor && v.size === selectedSize) ?? null;
  }, [variants, selectedColor, selectedSize]);

  useEffect(() => {
    onChange(matchingVariant);
  }, [matchingVariant, onChange]);

  const sizeEnabled = (size: string) => {
    if (!selectedColor) return true;
    return variants.some((v) => v.color === selectedColor && v.size === size);
  };

  const colorEnabled = (color: string) => {
    if (!selectedSize) return true;
    return variants.some((v) => v.size === selectedSize && v.color === color);
  };

  const chipBase =
    "rounded-full border px-3.5 py-2 text-sm font-semibold transition " +
    "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--brand))]/25";
  const chipActive =
    "bg-[rgb(var(--brand))]/10 border-[rgb(var(--brand))]/35 text-[rgb(var(--brand-strong))]";
  const chipIdle =
    "border-black/10 text-[rgb(var(--text))] bg-white hover:bg-black/5";
  const chipDisabled = "opacity-40 cursor-not-allowed";

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-[rgb(var(--text))]">Color</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {colors.map((c) => {
            const enabled = colorEnabled(c);
            const active = selectedColor === c;

            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedColor(active ? null : c)}
                disabled={!enabled}
                className={[
                  chipBase,
                  active ? chipActive : chipIdle,
                  !enabled ? chipDisabled : "",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-semibold text-[rgb(var(--text))]">Size</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((s) => {
            const enabled = sizeEnabled(s);
            const active = selectedSize === s;

            return (
              <button
                key={s}
                type="button"
                onClick={() => setSelectedSize(active ? null : s)}
                disabled={!enabled}
                className={[
                  chipBase,
                  active ? chipActive : chipIdle,
                  !enabled ? chipDisabled : "",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {!selectedColor || !selectedSize ? (
        <div className="text-sm text-[rgb(var(--muted))]">
          Select a color and a size to continue.
        </div>
      ) : matchingVariant ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <div className="text-[rgb(var(--text))]">
            Selected:{" "}
            <span className="font-semibold">{matchingVariant.color}</span> /{" "}
            <span className="font-semibold">{matchingVariant.size}</span>
          </div>

          {matchingVariant.in_stock === false ? (
            <span className="inline-flex rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
              Out of stock
            </span>
          ) : null}
        </div>
      ) : (
        <div className="text-sm text-red-600">No matching variant found.</div>
      )}
    </div>
  );
}
