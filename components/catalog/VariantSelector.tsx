// "use client";

// import { useMemo, useState } from "react";

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
//   wholesale_min_quantity?: number | null;
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

//   // whenever selection changes, emit variant
//   useMemo(() => {
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

//   return (
//     <div className="space-y-4">
//       <div>
//         <div className="text-sm font-medium text-gray-800">Color</div>
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
//                   "rounded-xl border px-3 py-2 text-sm",
//                   active ? "border-black text-gray-900" : "text-gray-700",
//                   !enabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
//                 ].join(" ")}
//               >
//                 {c}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <div>
//         <div className="text-sm font-medium text-gray-800">Size</div>
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
//                   "rounded-xl border px-3 py-2 text-sm",
//                   active ? "border-black text-gray-900" : "text-gray-700",
//                   !enabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
//                 ].join(" ")}
//               >
//                 {s}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {!selectedColor || !selectedSize ? (
//         <div className="text-sm text-gray-500">
//           Select a color and a size to continue.
//         </div>
//       ) : matchingVariant ? (
//         <div className="text-sm text-gray-700">
//           Selected: <span className="font-medium">{matchingVariant.color}</span> /{" "}
//           <span className="font-medium">{matchingVariant.size}</span>
//         </div>
//       ) : (
//         <div className="text-sm text-red-600">No matching variant found.</div>
//       )}
//     </div>
//   );
// }

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

  // ✅ side-effect belongs in useEffect
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

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-medium text-gray-800">Color</div>
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
                  "rounded-xl border px-3 py-2 text-sm",
                  active ? "border-black text-gray-900" : "text-gray-700",
                  !enabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-800">Size</div>
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
                  "rounded-xl border px-3 py-2 text-sm",
                  active ? "border-black text-gray-900" : "text-gray-700",
                  !enabled ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-50",
                ].join(" ")}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {!selectedColor || !selectedSize ? (
        <div className="text-sm text-gray-500">Select a color and a size to continue.</div>
      ) : matchingVariant ? (
        <div className="text-sm text-gray-700">
          Selected: <span className="font-medium">{matchingVariant.color}</span> /{" "}
          <span className="font-medium">{matchingVariant.size}</span>
        </div>
      ) : (
        <div className="text-sm text-red-600">No matching variant found.</div>
      )}
    </div>
  );
}
