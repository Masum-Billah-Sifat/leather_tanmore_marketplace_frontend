"use client";

// app/page.tsx
import { useEffect, useState } from "react";
import axios from "@/utils/axios";

type ApiBoxState = {
  loading: boolean;
  data: any | null;
  error: any | null;
};

function prettify(x: any) {
  try {
    return JSON.stringify(x, null, 2);
  } catch {
    return String(x);
  }
}

function toErrorPayload(err: any) {
  return {
    status: err?.response?.status,
    statusText: err?.response?.statusText,
    data: err?.response?.data,
    message: err?.message,
  };
}

export default function Home() {
  const [feed, setFeed] = useState<ApiBoxState>({ loading: false, data: null, error: null });
  const [cats, setCats] = useState<ApiBoxState>({ loading: false, data: null, error: null });
  const [search, setSearch] = useState<ApiBoxState>({ loading: false, data: null, error: null });

  const [q, setQ] = useState("shirt"); // default debug query

  const loadFeed = async () => {
    setFeed({ loading: true, data: null, error: null });
    try {
      const res = await axios.get("/api/feed", { params: { page: 1, per_page: 10 } });
      setFeed({ loading: false, data: res.data, error: null });
    } catch (err) {
      setFeed({ loading: false, data: null, error: toErrorPayload(err) });
    }
  };

  const loadCategories = async () => {
    setCats({ loading: true, data: null, error: null });
    try {
      const res = await axios.get("/api/categories/tree");
      setCats({ loading: false, data: res.data, error: null });
    } catch (err) {
      setCats({ loading: false, data: null, error: toErrorPayload(err) });
    }
  };

  const runSearch = async (query: string) => {
    setSearch({ loading: true, data: null, error: null });
    try {
      const res = await axios.get("/api/search", {
        params: { q: query, page: 1, per_page: 10 },
      });
      setSearch({ loading: false, data: res.data, error: null });
    } catch (err) {
      setSearch({ loading: false, data: null, error: toErrorPayload(err) });
    }
  };

  const loadAll = async () => {
    // run in parallel
    await Promise.all([loadFeed(), loadCategories(), runSearch(q)]);
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Homepage Debug Console</h1>
          <p className="mt-1 text-sm text-gray-600">
            Calls: <span className="font-medium">/api/feed</span>,{" "}
            <span className="font-medium">/api/search</span>,{" "}
            <span className="font-medium">/api/categories/tree</span>
          </p>
        </div>

        <button
          onClick={loadAll}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Refresh all
        </button>
      </div>

      {/* Search controls */}
      <div className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">Search query (q)</label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="mt-2 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
              placeholder="e.g., shirt"
            />
            <p className="mt-1 text-xs text-gray-500">
              /api/search requires <span className="font-medium">q</span> (non-empty).
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => runSearch(q)}
              className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Run search
            </button>
          </div>
        </div>
      </div>

      {/* Panels */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Feed */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">GET /api/feed</h2>
            <button
              onClick={loadFeed}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {feed.loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : feed.error ? (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-red-50 p-3 text-xs text-red-800">
                {prettify(feed.error)}
              </pre>
            ) : (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 text-xs text-gray-800">
                {prettify(feed.data)}
              </pre>
            )}
          </div>
        </section>

        {/* Search */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">GET /api/search</h2>
            <button
              onClick={() => runSearch(q)}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {search.loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : search.error ? (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-red-50 p-3 text-xs text-red-800">
                {prettify(search.error)}
              </pre>
            ) : (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 text-xs text-gray-800">
                {prettify(search.data)}
              </pre>
            )}
          </div>
        </section>

        {/* Categories */}
        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="text-sm font-semibold text-gray-900">GET /api/categories/tree</h2>
            <button
              onClick={loadCategories}
              className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          <div className="p-5">
            {cats.loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : cats.error ? (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-red-50 p-3 text-xs text-red-800">
                {prettify(cats.error)}
              </pre>
            ) : (
              <pre className="whitespace-pre-wrap break-words rounded-xl bg-gray-50 p-3 text-xs text-gray-800">
                {prettify(cats.data)}
              </pre>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
