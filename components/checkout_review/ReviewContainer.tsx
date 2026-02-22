// components/checkout_review/ReviewContainer.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { handleApiError } from "@/utils/handleApiError";
import CheckoutItemsHierarchy from "@/components/checkout/CheckoutItemsHierarchy";
import type { CheckoutReview } from "./types";
import { confirmOrder, fetchCheckoutReview } from "./api";
import ReviewShippingCard from "./ReviewShoppingCard";
import ReviewSummaryMeta from "./ReviewSummaryMeta";

export default function ReviewContainer({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [review, setReview] = useState<CheckoutReview | null>(null);

  const alertedInvalidRef = useRef(false);

  const refresh = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const r = await fetchCheckoutReview(sessionId);
      setReview(r);
    } catch (e) {
      handleApiError(e);
      setReview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    if (!sessionId) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, sessionId]);

  useEffect(() => {
    if (!review) return;
    if (alertedInvalidRef.current) return;

    const invalid = review.invalid_items ?? [];
    if (invalid.length > 0) {
      alertedInvalidRef.current = true;
      const msg =
        "Invalid items found:\n" +
        invalid
          .map((x) => `• ${x.variant_id.slice(0, 8)}… — ${x.failure_reason}`)
          .join("\n");
      alert(msg);
    }
  }, [review]);

  const canConfirm = useMemo(() => {
    if (!review) return false;
    if (!review.shipping_address) return false;
    if ((review.invalid_items ?? []).length > 0) return false;
    return true;
  }, [review]);

  const onConfirm = async () => {
    if (!review) return;
    if (!canConfirm) return;

    setConfirming(true);
    try {
      await confirmOrder(sessionId);
      alert("Order confirmed successfully.");
      router.push("/");
    } catch (e) {
      handleApiError(e);
    } finally {
      setConfirming(false);
    }
  };

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-8 shadow-sm">
          <div className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
            Review order
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Please login first to continue.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-6 inline-flex rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5"
          >
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  if (!sessionId) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-8 shadow-sm">
          <div className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
            Review order
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Missing session_id in the URL.
          </p>
          <button
            onClick={() => router.push("/cart")}
            className="mt-6 inline-flex rounded-full bg-[rgb(var(--brand-strong))] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-95"
          >
            Go to cart
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display text-3xl font-semibold tracking-tight text-[rgb(var(--text))]">
            Review order
          </div>
          <div className="mt-1 text-sm text-[rgb(var(--muted))]">
            Confirm shipping and items before placing your order.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => router.push(`/checkout?session_id=${sessionId}`)}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
            disabled={!sessionId}
          >
            Back to checkout
          </button>

          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5"
          >
            Continue shopping
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Shipping + Items */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div>
              <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                Shipping address
              </div>
              <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                Make sure it’s correct before confirming.
              </div>
            </div>

            <div className="mt-5">
              {loading ? (
                <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
                  Loading…
                </div>
              ) : review ? (
                <ReviewShippingCard shipping={review.shipping_address} />
              ) : (
                <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
                  No review data loaded.
                </div>
              )}
            </div>

            {!loading && review && !review.shipping_address ? (
              <div className="mt-3 text-xs text-[rgb(var(--muted))]">
                Go back to checkout and add a shipping address.
              </div>
            ) : null}
          </section>

          <section className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                Items
              </div>

              {review ? (
                <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
                  {review.valid_items?.length ?? 0} valid
                  {(review.invalid_items?.length ?? 0)
                    ? ` • ${review.invalid_items?.length ?? 0} invalid`
                    : ""}
                </div>
              ) : null}
            </div>

            <div className="mt-4">
              {loading ? (
                <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
                  Loading items…
                </div>
              ) : !review ? (
                <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
                  No review data loaded.
                </div>
              ) : (
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <CheckoutItemsHierarchy
                    validItems={review.valid_items || []}
                    invalidItems={review.invalid_items || []}
                  />
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right: Summary + Confirm */}
        <div className="space-y-6 lg:sticky lg:top-28 h-fit">
          {loading ? (
            <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm text-sm text-[rgb(var(--muted))]">
              Loading summary…
            </div>
          ) : review ? (
            <ReviewSummaryMeta review={review} />
          ) : (
            <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm text-sm text-[rgb(var(--muted))]">
              No summary loaded.
            </div>
          )}

          <section className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
              Confirm order
            </div>
            <div className="mt-1 text-sm text-[rgb(var(--muted))]">
              Cash on delivery. Confirmation is blocked if shipping is missing
              or any item is invalid.
            </div>

            <button
              onClick={onConfirm}
              disabled={
                !sessionId || loading || confirming || !review || !canConfirm
              }
              className="mt-5 w-full rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
            >
              {confirming ? "Confirming…" : "Confirm order (COD)"}
            </button>

            {review && !canConfirm ? (
              <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4 text-xs text-[rgb(var(--muted))]">
                {!review.shipping_address
                  ? "• Shipping address is missing.\n"
                  : ""}
                {(review.invalid_items?.length ?? 0) > 0
                  ? "• One or more items are invalid.\n"
                  : ""}
              </div>
            ) : null}

            <button
              onClick={refresh}
              disabled={loading || !sessionId}
              className="mt-3 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
            >
              Refresh
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
