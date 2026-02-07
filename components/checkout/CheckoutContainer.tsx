// components/checkout/CheckoutContainer.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { handleApiError } from "@/utils/handleApiError";
import type { CheckoutDetails } from "./types";
import { fetchCheckoutDetails } from "./api";
import ShippingAddressSection from "./ShippingAddressSection";
import CheckoutItemsHierarchy from "./CheckoutItemsHierarchy";
import CheckoutSessionMeta from "./CheckoutSessionMeta";

export default function CheckoutContainer({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<CheckoutDetails | null>(null);

  const canReview = !!details?.has_shipping_address_details;

  const refresh = async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const d = await fetchCheckoutDetails(sessionId);
      setDetails(d);
    } catch (e) {
      handleApiError(e);
      setDetails(null);
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

  const headerText = useMemo(() => {
    if (!sessionId) return "Missing session_id in URL";
    return sessionId;
  }, [sessionId]);

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
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

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
            <p className="mt-1 text-sm text-gray-600">Session ID</p>
            <div className="mt-2 font-mono text-sm text-gray-800 break-all">{headerText}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/cart")}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
            >
              Back to cart
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
                Add shipping details to enable review. (Latitude/Longitude skipped for now.)
              </div>

              <div className="mt-4">
                <ShippingAddressSection
                  sessionId={sessionId}
                  loading={loading}
                  details={details}
                  onChanged={refresh}
                />
              </div>
            </div>

            <div className="rounded-2xl border p-5">
              <div className="text-sm font-semibold text-gray-900">Items</div>
              <div className="mt-2 text-sm text-gray-600">
                Grouped hierarchy: seller → category → product → variants.
              </div>

              {loading ? (
                <div className="mt-4 text-sm text-gray-500">Loading checkout details…</div>
              ) : !details ? (
                <div className="mt-4 text-sm text-gray-600">No checkout data loaded.</div>
              ) : (
                <div className="mt-4">
                  <CheckoutItemsHierarchy
                    validItems={details.valid_items || []}
                    invalidItems={details.invalid_items || []}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Session summary</div>

              {loading ? (
                <div className="mt-3 text-sm text-gray-500">Loading…</div>
              ) : details ? (
                <div className="mt-3">
                  <CheckoutSessionMeta session={details.checkout_session} />
                </div>
              ) : (
                <div className="mt-3 text-sm text-gray-600">No session loaded.</div>
              )}

              <button
                onClick={() => router.push(`/checkout/review?session_id=${sessionId}`)}
                disabled={!canReview || loading || !details}
                className="mt-5 w-full rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:bg-gray-300"
              >
                Review order
              </button>

              {!canReview && details ? (
                <div className="mt-2 text-xs text-gray-500">
                  Add shipping address to enable review.
                </div>
              ) : null}
            </div>

            <button
              onClick={refresh}
              disabled={loading || !sessionId}
              className="w-full rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
