// app/checkout/review/page.tsx
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ReviewContainer from "@/components/checkout_review//ReviewContainer";

export default function CheckoutReviewPage() {
  const sp = useSearchParams();
  const sessionId = useMemo(() => sp.get("session_id") || "", [sp]);

  return <ReviewContainer sessionId={sessionId} />;
}
