// src/components/seller/SellerProductGridSkeleton.tsx
function SkeletonCard() {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-14 w-14 rounded-xl border bg-gray-100" />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="h-4 w-2/3 rounded bg-gray-100" />
            <div className="h-5 w-16 rounded-full bg-gray-100" />
          </div>
          <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
          <div className="mt-3 h-3 w-3/4 rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export default function SellerProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}