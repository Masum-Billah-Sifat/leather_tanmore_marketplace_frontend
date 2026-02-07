// // components/checkout/CheckoutSessionMeta.tsx
// "use client";

// import type { CheckoutSession } from "./types";

// export default function CheckoutSessionMeta({ session }: { session: CheckoutSession }) {
//   return (
//     <div className="space-y-2 text-sm">
//       <div className="flex justify-between gap-4">
//         <span className="text-gray-600">Status</span>
//         <span className="font-medium text-gray-900">{session.status}</span>
//       </div>

//       <div className="flex justify-between gap-4">
//         <span className="text-gray-600">Subtotal</span>
//         <span className="font-medium text-gray-900">৳{session.subtotal}</span>
//       </div>

//       <div className="flex justify-between gap-4">
//         <span className="text-gray-600">Delivery</span>
//         <span className="font-medium text-gray-900">
//           {session.delivery_charge ? `৳${session.delivery_charge}` : "—"}
//         </span>
//       </div>

//       <div className="flex justify-between gap-4">
//         <span className="text-gray-600">Total payable</span>
//         <span className="text-lg font-semibold text-gray-900">৳{session.total_payable}</span>
//       </div>

//       <div className="flex justify-between gap-4">
//         <span className="text-gray-600">Payment method</span>
//         <span className="font-medium text-gray-900">{session.payment_method}</span>
//       </div>

//       <div className="flex justify-between gap-4">
//         <span className="text-gray-600">Weight</span>
//         <span className="font-medium text-gray-900">{session.total_weight_grams}g</span>
//       </div>

//       {session.is_platform_discount_applied ? (
//         <div className="mt-3 rounded-xl border bg-gray-50 p-3">
//           <div className="text-xs font-semibold text-gray-800">Platform discount</div>
//           <div className="mt-1 text-xs text-gray-700">
//             Type: {session.platform_discount_type ?? "—"} • Value:{" "}
//             {session.platform_discount_value ?? "—"} • Applied:{" "}
//             {session.platform_discount_amount_applied ?? "—"}
//           </div>
//         </div>
//       ) : null}
//     </div>
//   );
// }

// components/checkout/CheckoutSessionMeta.tsx
"use client";

import type { CheckoutSession } from "./types";

export default function CheckoutSessionMeta({ session }: { session: CheckoutSession }) {
  const dc = session.delivery_charge; // string | null

  const pdType = session.platform_discount_type;
  const pdVal = session.platform_discount_value;
  const pdApplied = session.platform_discount_amount_applied;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between gap-4">
        <span className="text-gray-600">Status</span>
        <span className="font-medium text-gray-900">{session.status}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-600">Subtotal</span>
        <span className="font-medium text-gray-900">৳{session.subtotal}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-600">Delivery</span>
        <span className="font-medium text-gray-900">{dc ? `৳${dc}` : "—"}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-600">Total payable</span>
        <span className="text-lg font-semibold text-gray-900">৳{session.total_payable}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-600">Payment method</span>
        <span className="font-medium text-gray-900">{session.payment_method}</span>
      </div>

      <div className="flex justify-between gap-4">
        <span className="text-gray-600">Weight</span>
        <span className="font-medium text-gray-900">{session.total_weight_grams}g</span>
      </div>

      {session.is_platform_discount_applied ? (
        <div className="mt-3 rounded-xl border bg-gray-50 p-3">
          <div className="text-xs font-semibold text-gray-800">Platform discount</div>
          <div className="mt-1 text-xs text-gray-700">
            Type: {pdType ?? "—"} • Value: {pdVal ?? "—"} • Applied: {pdApplied ?? "—"}
          </div>
        </div>
      ) : null}
    </div>
  );
}
