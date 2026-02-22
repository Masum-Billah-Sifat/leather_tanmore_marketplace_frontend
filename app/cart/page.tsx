// app/cart/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCartStore } from "@/stores/useCartStore";
import CartGroup from "@/components/cart/CartGroup";
import { handleApiError } from "@/utils/handleApiError";
import { initiateCheckoutFromCart } from "@/utils/checkout";

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const cart = useCartStore();

  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const selectedIds = useMemo(() => {
    return Object.keys(cart.selected || {}).filter((k) => cart.selected[k]);
  }, [cart.selected]);

  const allIds = useMemo(
    () => Object.keys(cart.itemsByVariantId || {}),
    [cart.itemsByVariantId],
  );

  const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
  const anySelected = selectedIds.length > 0;

  useEffect(() => {
    if (!user) return;
    if (!cart.hydrated && !cart.loading) {
      cart.fetchCart().catch((e) => handleApiError(e));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user || !cart.hydrated) return;

    const t = setTimeout(() => {
      cart.refreshSummary().catch(() => {});
    }, 250);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, cart.hydrated, cart.selected]);

  const onClear = async () => {
    try {
      await cart.clearCart();
      await cart.refreshSummary();
    } catch (e) {
      handleApiError(e);
    }
  };

  const onCheckout = async () => {
    if (!user) {
      alert("Please login first to checkout.");
      return;
    }
    if (selectedIds.length === 0) return;

    setCheckoutLoading(true);
    try {
      const sessionId = await initiateCheckoutFromCart({ variant_ids: selectedIds });
      router.push(`/checkout?session_id=${encodeURIComponent(sessionId)}`);
    } catch (e) {
      handleApiError(e);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-8 shadow-sm">
          <div className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
            Your Cart
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Please login first to view your cart.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
          >
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[rgb(var(--text))]">
            Your Cart
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">
            Select items to checkout.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-start gap-2 sm:justify-end">
          {allIds.length > 0 ? (
            allSelected ? (
              <button
                onClick={() => cart.unselectAll()}
                className="rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
                disabled={cart.loading || checkoutLoading}
              >
                Unselect all
              </button>
            ) : (
              <button
                onClick={() => cart.selectAll()}
                className="rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
                disabled={cart.loading || checkoutLoading}
              >
                Select all
              </button>
            )
          ) : null}

          <button
            onClick={onClear}
            className="rounded-full px-4 py-2 text-sm font-medium text-white bg-[rgb(var(--brand-strong))] hover:opacity-95 disabled:opacity-40"
            disabled={cart.loading || checkoutLoading || allIds.length === 0}
          >
            Clear cart
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {cart.loading ? (
            <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 text-sm text-[rgb(var(--muted))]">
              Loading cart…
            </div>
          ) : cart.groups.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-8 shadow-sm">
              <div className="font-display text-xl font-semibold text-[rgb(var(--text))]">
                Your cart is empty
              </div>
              <p className="mt-2 text-sm text-[rgb(var(--muted))]">
                Explore leather essentials and add your favorites.
              </p>
              <button
                onClick={() => router.push("/")}
                className="mt-6 inline-flex rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            cart.groups.map((seller: any) => (
              <CartGroup key={seller.seller_id} seller={seller} />
            ))
          )}

          {cart.invalidItems?.length ? (
            <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
              <div>
                <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                  Skipped items
                </div>
                <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                  These items couldn’t be added due to availability/moderation/stock rules.
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {cart.invalidItems.map((x: any) => (
                  <div
                    key={x.variant_id}
                    className="rounded-2xl border border-black/10 bg-white px-4 py-3"
                  >
                    <div className="text-sm font-semibold text-[rgb(var(--text))]">
                      {x.product_title ?? "Unknown product"}{" "}
                      <span className="font-normal text-[rgb(var(--muted))]">
                        ({x.color ?? "?"}/{x.size ?? "?"})
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">{x.reason}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-32 h-fit">
          <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                Summary
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))] border border-black/10">
                {selectedIds.length} selected
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
              {cart.summaryLoading ? (
                <div className="text-sm text-[rgb(var(--muted))]">Calculating…</div>
              ) : (
                <>
                  <div className="flex items-baseline justify-between">
                    <div className="text-sm text-[rgb(var(--muted))]">Total</div>
                    <div className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
                      ৳{cart.summary?.total_price ?? 0}
                    </div>
                  </div>

                  {cart.summary?.invalid_items?.length ? (
                    <div className="mt-4 rounded-2xl border border-black/10 bg-[rgb(var(--brand))]/[0.06] p-3">
                      <div className="text-xs font-semibold text-[rgb(var(--text))]">
                        Summary skipped items
                      </div>
                      <div className="mt-2 space-y-1">
                        {cart.summary.invalid_items.map((x: any) => (
                          <div key={x.variant_id} className="text-xs text-[rgb(var(--muted))]">
                            {(x.product_title ?? "Unknown")} — {x.reason}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <button
              onClick={onCheckout}
              className="mt-5 w-full rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
              disabled={!anySelected || cart.loading || checkoutLoading}
            >
              {checkoutLoading ? "Starting checkout..." : "Proceed to checkout"}
            </button>

            <button
              onClick={() => router.push("/")}
              className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
              disabled={checkoutLoading}
            >
              Continue shopping
            </button>

            {!anySelected && allIds.length > 0 ? (
              <div className="mt-3 text-xs text-[rgb(var(--muted))]">
                Select one or more variants to enable checkout.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
