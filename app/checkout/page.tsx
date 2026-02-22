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
