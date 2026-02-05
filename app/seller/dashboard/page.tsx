import Link from "next/link";

export default function SellerDashboardPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Seller Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your products, media, variants, and orders.
          </p>
        </div>

        <Link
          href="/seller/products/create"
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
        >
          Create a Product
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Products</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">—</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Orders</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">—</p>
        </div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">—</p>
        </div>
      </div>
    </main>
  );
}
