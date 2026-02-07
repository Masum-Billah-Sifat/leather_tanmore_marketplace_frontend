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

  // alert invalid items once (simple UX for now)
  useEffect(() => {
    if (!review) return;
    if (alertedInvalidRef.current) return;

    const invalid = review.invalid_items ?? [];
    if (invalid.length > 0) {
      alertedInvalidRef.current = true;
      const msg =
        "Invalid items found:\n" +
        invalid.map((x) => `• ${x.variant_id.slice(0, 8)}… — ${x.failure_reason}`).join("\n");
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
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Review Order</h1>
          <p className="mt-2 text-sm text-gray-600">Please login first to continue.</p>
          <div className="mt-6">
            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Continue shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  const headerText = sessionId ? sessionId : "Missing session_id in URL";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Review Order</h1>
            <p className="mt-1 text-sm text-gray-600">Checkout session</p>
            <div className="mt-2 font-mono text-sm text-gray-800 break-all">{headerText}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/checkout?session_id=${sessionId}`)}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
              disabled={!sessionId}
            >
              Back to checkout
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Continue shopping
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border bg-gray-50 p-5">
              <div className="text-sm font-semibold text-gray-900">Shipping</div>
              <div className="mt-2 text-sm text-gray-600">
                Review shipping details before confirming.
              </div>

              <div className="mt-4">
                {loading ? (
                  <div className="text-sm text-gray-500">Loading…</div>
                ) : review ? (
                  <ReviewShippingCard shipping={review.shipping_address} />
                ) : (
                  <div className="text-sm text-gray-600">No review data loaded.</div>
                )}
              </div>

              {!loading && review && !review.shipping_address ? (
                <div className="mt-3 text-xs text-gray-600">
                  Go back to checkout and add shipping address.
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold text-gray-900">Items</div>
              <div className="mt-2 text-sm text-gray-600">
                Grouped hierarchy: seller → category → product → variants.
              </div>

              {loading ? (
                <div className="mt-4 text-sm text-gray-500">Loading review…</div>
              ) : !review ? (
                <div className="mt-4 text-sm text-gray-600">No review data loaded.</div>
              ) : (
                <div className="mt-4">
                  <CheckoutItemsHierarchy
                    validItems={review.valid_items || []}
                    invalidItems={review.invalid_items || []}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm text-gray-500">
                Loading summary…
              </div>
            ) : review ? (
              <ReviewSummaryMeta review={review} />
            ) : (
              <div className="rounded-2xl border bg-white p-5 shadow-sm text-sm text-gray-600">
                No summary loaded.
              </div>
            )}

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Confirm</div>
              <div className="mt-2 text-sm text-gray-600">
                Confirmation is blocked if shipping is missing or any item is invalid.
              </div>

              <button
                onClick={onConfirm}
                disabled={!sessionId || loading || confirming || !review || !canConfirm}
                className="mt-4 w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                {confirming ? "Confirming…" : "Confirm order (COD)"}
              </button>

              {review && !canConfirm ? (
                <div className="mt-2 text-xs text-gray-500">
                  {(!review.shipping_address ? "Missing shipping address. " : "") +
                    ((review.invalid_items?.length ?? 0) > 0 ? "Invalid items exist. " : "")}
                </div>
              ) : null}
            </div>

            <button
              onClick={refresh}
              disabled={loading || !sessionId}
              className="w-full rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
            >
              Refresh review
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
