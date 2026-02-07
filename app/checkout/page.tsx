// "use client";

// import { useMemo } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function CheckoutPage() {
//   const router = useRouter();
//   const sp = useSearchParams();

//   const sessionId = useMemo(() => sp.get("session_id") || "", [sp]);

//   return (
//     <main className="mx-auto max-w-3xl px-6 py-10">
//       <div className="rounded-2xl border bg-white p-6 shadow-sm">
//         <h1 className="text-2xl font-semibold text-gray-900">Checkout</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Minimal placeholder page. We’ll build the real checkout UI next.
//         </p>

//         <div className="mt-6 rounded-xl border bg-gray-50 p-4">
//           <div className="text-sm font-medium text-gray-900">checkout_session_id</div>
//           <div className="mt-2 font-mono text-sm text-gray-800 break-all">
//             {sessionId ? sessionId : "Missing session_id in URL"}
//           </div>
//         </div>

//         <div className="mt-6 flex gap-3">
//           <button
//             onClick={() => router.push("/cart")}
//             className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-900"
//           >
//             Back to cart
//           </button>

//           <button
//             onClick={() => router.push("/")}
//             className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
//           >
//             Continue shopping
//           </button>
//         </div>
//       </div>
//     </main>
//   );
// }

// app/checkout/page.tsx
import CheckoutContainer from "@/components/checkout/CheckoutContainer";

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id ?? "";
  return <CheckoutContainer sessionId={sessionId} />;
}
