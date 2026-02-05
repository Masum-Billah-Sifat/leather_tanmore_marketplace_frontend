import Link from "next/link";
import CreateProductForm from "./CreateProductForm";

export default function CreateProductPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Create Product</h1>
          <p className="mt-1 text-sm text-gray-600">
            Choose a leaf category, upload media, add variants, then publish.
          </p>
        </div>

        <Link
          href="/seller/dashboard"
          className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="mt-8">
        <CreateProductForm />
      </div>
    </main>
  );
}
