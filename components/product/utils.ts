import type { Variant } from "@/components/catalog/VariantSelector";

export function money(n: number) {
  const safe = Number.isFinite(n) ? n : 0;
  return `৳${safe.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

export function retailFinal(v: Variant) {
  const base = Number(v.retail_price ?? 0);
  if (!v.has_retail_discount || !v.retail_discount) return base;

  const d = Number(v.retail_discount ?? 0);
  const t = v.retail_discount_type ?? "flat";
  if (t === "percentage") return Math.max(0, base * (1 - d / 100));
  return Math.max(0, base - d);
}

export function wholesaleFinal(v: Variant) {
  const base = Number(v.wholesale_price ?? 0);
  const has = !!v.wholesale_discount && !!v.wholesale_discount_type;
  if (!has) return base;

  const d = Number(v.wholesale_discount ?? 0);
  const t = v.wholesale_discount_type ?? "flat";
  if (t === "percentage") return Math.max(0, base * (1 - d / 100));
  return Math.max(0, base - d);
}
