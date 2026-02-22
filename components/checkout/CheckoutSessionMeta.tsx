// components/checkout/CheckoutSessionMeta.tsx
"use client";

import type { CheckoutSession } from "./types";

function money(x: any) {
  const n = Number.parseFloat(String(x ?? "0"));
  const safe = Number.isFinite(n) ? n : 0;
  return `৳${safe.toLocaleString("en-BD", { maximumFractionDigits: 2 })}`;
}

function prettyPayment(m: CheckoutSession["payment_method"]) {
  return m === "cod" ? "Cash on delivery" : "Prepaid";
}

export default function CheckoutSessionMeta({ session }: { session: CheckoutSession }) {
  const dc = session.delivery_charge; // string | null

  const pdType = session.platform_discount_type;
  const pdVal = session.platform_discount_value;
  const pdApplied = session.platform_discount_amount_applied;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[rgb(var(--muted))]">Subtotal</span>
        <span className="text-sm font-semibold text-[rgb(var(--text))]">
          {money(session.subtotal)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        <span className="text-sm text-[rgb(var(--muted))]">Delivery</span>
        <span className="text-sm font-semibold text-[rgb(var(--text))]">
          {dc ? money(dc) : "—"}
        </span>
      </div>

      {session.is_platform_discount_applied ? (
        <div className="rounded-2xl border border-black/10 bg-[rgb(var(--brand))]/[0.06] p-3">
          <div className="text-xs font-semibold text-[rgb(var(--text))]">
            Platform discount applied
          </div>
          <div className="mt-1 text-xs text-[rgb(var(--muted))]">
            {pdType ? `Type: ${pdType}` : "Type: —"}
            {pdVal ? ` • Value: ${pdVal}` : ""}
            {pdApplied ? ` • Applied: ${pdApplied}` : ""}
          </div>
        </div>
      ) : null}

      <div className="pt-2 border-t border-black/10">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-sm text-[rgb(var(--muted))]">Total payable</span>
          <span className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
            {money(session.total_payable)}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <span className="text-sm text-[rgb(var(--muted))]">Payment method</span>
          <span className="text-sm font-semibold text-[rgb(var(--text))]">
            {prettyPayment(session.payment_method)}
          </span>
        </div>
      </div>
    </div>
  );
}
