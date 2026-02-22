// src/components/seller/JsonViewer.tsx
"use client";

export default function JsonViewer({
  title = "Response JSON",
  data,
}: {
  title?: string;
  data: any;
}) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <button
          type="button"
          className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-900"
          onClick={() => {
            try {
              navigator.clipboard.writeText(JSON.stringify(data ?? {}, null, 2));
            } catch {}
          }}
        >
          Copy
        </button>
      </div>

      <pre className="mt-3 max-h-[60vh] overflow-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-900">
        {JSON.stringify(data ?? {}, null, 2)}
      </pre>
    </div>
  );
}