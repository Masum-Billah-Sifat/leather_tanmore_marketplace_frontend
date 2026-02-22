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

  const headerSubtitle = useMemo(() => {
    if (!sessionId) return "Missing checkout session.";
    return "Complete shipping details to review your order.";
  }, [sessionId]);

  if (!user) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-2">
        <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-8 shadow-sm">
          <div className="font-display text-2xl font-semibold text-[rgb(var(--text))]">
            Checkout
          </div>
          <p className="mt-2 text-sm text-[rgb(var(--muted))]">
            Please login first to continue.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => router.push("/")}
              className="inline-flex rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
            >
              Continue shopping
            </button>
            <button
              onClick={() => router.push("/cart")}
              className="inline-flex rounded-full border border-black/10 bg-[rgb(var(--surface))] px-5 py-2.5 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
            >
              Back to cart
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-[rgb(var(--text))]">
            Checkout
          </h1>
          <p className="mt-1 text-sm text-[rgb(var(--muted))]">{headerSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            onClick={() => router.push("/cart")}
            className="rounded-full border border-black/10 bg-[rgb(var(--surface))] px-4 py-2 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
          >
            Back to cart
          </button>

          <button
            onClick={() => router.push("/")}
            className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-[rgb(var(--text))] hover:bg-black/5"
          >
            Continue shopping
          </button>

          <button
            onClick={refresh}
            disabled={loading || !sessionId}
            className="rounded-full px-4 py-2 text-sm font-semibold text-white bg-[rgb(var(--brand-strong))] hover:opacity-95 disabled:opacity-40"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping */}
          <section className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                  Shipping address
                </div>
                <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                  Add or edit shipping details to enable order review.
                </div>
              </div>
            </div>

            <div className="mt-5">
              <ShippingAddressSection
                sessionId={sessionId}
                loading={loading}
                details={details}
                onChanged={refresh}
              />
            </div>
          </section>

          {/* Items */}
          <section className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                Items
              </div>
              {details?.valid_items?.length ? (
                <div className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
                  {details.valid_items.length} items
                </div>
              ) : null}
            </div>

            {loading ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
                Loading checkout details…
              </div>
            ) : !details ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4 text-sm text-[rgb(var(--muted))]">
                No checkout data loaded.
              </div>
            ) : (
              <div className="mt-5">
                <CheckoutItemsHierarchy
                  validItems={details.valid_items || []}
                  invalidItems={details.invalid_items || []}
                />
              </div>
            )}
          </section>
        </div>

        {/* Right */}
        <div className="lg:sticky lg:top-32 h-fit">
          <div className="rounded-3xl border border-black/10 bg-[rgb(var(--surface))] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                Summary
              </div>
              {details?.checkout_session?.status ? (
                <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-semibold text-[rgb(var(--muted))]">
                  {details.checkout_session.status}
                </span>
              ) : null}
            </div>

            <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
              {loading ? (
                <div className="text-sm text-[rgb(var(--muted))]">Loading…</div>
              ) : details ? (
                <CheckoutSessionMeta session={details.checkout_session} />
              ) : (
                <div className="text-sm text-[rgb(var(--muted))]">No session loaded.</div>
              )}
            </div>

            <button
              onClick={() => router.push(`/checkout/review?session_id=${sessionId}`)}
              disabled={!canReview || loading || !details}
              className="mt-5 w-full rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-3 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
            >
              Review order
            </button>

            {!canReview && details ? (
              <div className="mt-2 text-xs text-[rgb(var(--muted))]">
                Add shipping address to enable review.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
