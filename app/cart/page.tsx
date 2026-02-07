// "use client";

// import { useEffect, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/stores/useAuthStore";
// import { useCartStore } from "@/stores/useCartStore";
// import CartGroup from "@/components/cart/CartGroup";
// import { handleApiError } from "@/utils/handleApiError";

// export default function CartPage() {
//   const router = useRouter();
//   const { user } = useAuthStore();
//   const cart = useCartStore();

//   const selectedIds = useMemo(() => {
//     return Object.keys(cart.selected || {}).filter((k) => cart.selected[k]);
//   }, [cart.selected]);

//   const allIds = useMemo(() => Object.keys(cart.itemsByVariantId || {}), [cart.itemsByVariantId]);

//   const allSelected = allIds.length > 0 && selectedIds.length === allIds.length;
//   const anySelected = selectedIds.length > 0;

//   useEffect(() => {
//     if (!user) return;
//     if (!cart.hydrated && !cart.loading) {
//       cart.fetchCart().catch((e) => handleApiError(e));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user]);

//   useEffect(() => {
//     if (!user || !cart.hydrated) return;

//     const t = setTimeout(() => {
//       cart.refreshSummary().catch(() => {});
//     }, 250);

//     return () => clearTimeout(t);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, cart.hydrated, cart.selected]);

//   const onClear = async () => {
//     try {
//       await cart.clearCart();
//       await cart.refreshSummary();
//     } catch (e) {
//       handleApiError(e);
//     }
//   };

//   if (!user) {
//     return (
//       <main className="mx-auto max-w-6xl px-6 py-10">
//         <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
//         <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
//           <p className="text-sm text-gray-600">Please login first to view your cart.</p>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className="mx-auto max-w-6xl px-6 py-10">
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
//           <p className="mt-1 text-sm text-gray-600">
//             Hierarchy: seller → product → variants. Selection drives summary.
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           {allIds.length > 0 ? (
//             allSelected ? (
//               <button
//                 onClick={() => cart.unselectAll()}
//                 className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
//               >
//                 Unselect all
//               </button>
//             ) : (
//               <button
//                 onClick={() => cart.selectAll()}
//                 className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
//               >
//                 Select all
//               </button>
//             )
//           ) : null}

//           <button
//             onClick={onClear}
//             className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
//             disabled={cart.loading || allIds.length === 0}
//           >
//             Clear cart
//           </button>

//           <button
//             onClick={() => alert("Checkout flow will be added later.")}
//             className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
//             disabled={!anySelected}
//           >
//             Proceed to checkout
//           </button>
//         </div>
//       </div>

//       <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
//         <div className="lg:col-span-2 space-y-5">
//           {cart.loading ? (
//             <div className="text-sm text-gray-500">Loading cart…</div>
//           ) : cart.groups.length === 0 ? (
//             <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">
//               Your cart is empty.
//             </div>
//           ) : (
//             cart.groups.map((seller: any) => <CartGroup key={seller.seller_id} seller={seller} />)
//           )}

//           {cart.invalidItems?.length ? (
//             <div className="rounded-2xl border bg-white p-5 shadow-sm">
//               <div className="text-sm font-semibold text-gray-900">Invalid / skipped items</div>
//               <div className="mt-3 space-y-2">
//                 {cart.invalidItems.map((x: any) => (
//                   <div key={x.variant_id} className="text-sm text-gray-700">
//                     <span className="font-medium">{x.product_title ?? "Unknown product"}</span>{" "}
//                     ({x.color ?? "?"}/{x.size ?? "?"}) —{" "}
//                     <span className="text-gray-500">{x.reason}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ) : null}
//         </div>

//         <div className="rounded-2xl border bg-white p-5 shadow-sm h-fit">
//           <div className="text-sm font-semibold text-gray-900">Summary</div>

//           <div className="mt-2 text-sm text-gray-600">
//             Selected variants: <span className="font-medium">{selectedIds.length}</span>
//           </div>

//           {cart.summaryLoading ? (
//             <div className="mt-4 text-sm text-gray-500">Calculating…</div>
//           ) : (
//             <div className="mt-4">
//               <div className="text-sm text-gray-700">
//                 Total price:{" "}
//                 <span className="text-lg font-semibold text-gray-900">
//                   ৳{cart.summary?.total_price ?? 0}
//                 </span>
//               </div>

//               {cart.summary?.invalid_items?.length ? (
//                 <div className="mt-4 rounded-xl border bg-gray-50 p-3">
//                   <div className="text-xs font-semibold text-gray-800">Summary invalid items</div>
//                   <div className="mt-2 space-y-1">
//                     {cart.summary.invalid_items.map((x: any) => (
//                       <div key={x.variant_id} className="text-xs text-gray-700">
//                         {x.product_title ? <span className="font-medium">{x.product_title}</span> : "Unknown"}{" "}
//                         — <span className="text-gray-500">{x.reason}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               ) : null}
//             </div>
//           )}

//           <button
//             onClick={() => router.push("/")}
//             className="mt-6 w-full rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
//           >
//             Continue shopping
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }

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
    [cart.itemsByVariantId]
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
        <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
        <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Please login first to view your cart.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your Cart</h1>
          <p className="mt-1 text-sm text-gray-600">
            Hierarchy: seller → product → variants. Selection drives summary.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {allIds.length > 0 ? (
            allSelected ? (
              <button
                onClick={() => cart.unselectAll()}
                className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
                disabled={cart.loading || checkoutLoading}
              >
                Unselect all
              </button>
            ) : (
              <button
                onClick={() => cart.selectAll()}
                className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
                disabled={cart.loading || checkoutLoading}
              >
                Select all
              </button>
            )
          ) : null}

          <button
            onClick={onClear}
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
            disabled={cart.loading || checkoutLoading || allIds.length === 0}
          >
            Clear cart
          </button>

          <button
            onClick={onCheckout}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900 disabled:opacity-40"
            disabled={!anySelected || cart.loading || checkoutLoading}
          >
            {checkoutLoading ? "Starting checkout..." : "Proceed to checkout"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {cart.loading ? (
            <div className="text-sm text-gray-500">Loading cart…</div>
          ) : cart.groups.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">
              Your cart is empty.
            </div>
          ) : (
            cart.groups.map((seller: any) => (
              <CartGroup key={seller.seller_id} seller={seller} />
            ))
          )}

          {cart.invalidItems?.length ? (
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold text-gray-900">Invalid / skipped items</div>
              <div className="mt-3 space-y-2">
                {cart.invalidItems.map((x: any) => (
                  <div key={x.variant_id} className="text-sm text-gray-700">
                    <span className="font-medium">{x.product_title ?? "Unknown product"}</span>{" "}
                    ({x.color ?? "?"}/{x.size ?? "?"}) —{" "}
                    <span className="text-gray-500">{x.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm h-fit">
          <div className="text-sm font-semibold text-gray-900">Summary</div>

          <div className="mt-2 text-sm text-gray-600">
            Selected variants: <span className="font-medium">{selectedIds.length}</span>
          </div>

          {cart.summaryLoading ? (
            <div className="mt-4 text-sm text-gray-500">Calculating…</div>
          ) : (
            <div className="mt-4">
              <div className="text-sm text-gray-700">
                Total price:{" "}
                <span className="text-lg font-semibold text-gray-900">
                  ৳{cart.summary?.total_price ?? 0}
                </span>
              </div>

              {cart.summary?.invalid_items?.length ? (
                <div className="mt-4 rounded-xl border bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-800">Summary invalid items</div>
                  <div className="mt-2 space-y-1">
                    {cart.summary.invalid_items.map((x: any) => (
                      <div key={x.variant_id} className="text-xs text-gray-700">
                        {x.product_title ? (
                          <span className="font-medium">{x.product_title}</span>
                        ) : (
                          "Unknown"
                        )}{" "}
                        — <span className="text-gray-500">{x.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          <button
            onClick={() => router.push("/")}
            className="mt-6 w-full rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
            disabled={checkoutLoading}
          >
            Continue shopping
          </button>
        </div>
      </div>
    </main>
  );
}
