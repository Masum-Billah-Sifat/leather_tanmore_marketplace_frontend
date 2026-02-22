"use client";

import { useState } from "react";
import type { SellerProductDetail } from "@/types/sellerProductDetail";
import { handleApiError } from "@/utils/handleApiError";
import { updateProductInfo } from "@/api/sellerProductApi";

export default function ProductInfoCard({
  product,
  onUpdated,
}: {
  product: SellerProductDetail;
  onUpdated: () => Promise<void>;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);

  const [title, setTitle] = useState(product.title || "");
  const [description, setDescription] = useState(product.description || "");

  const [saving, setSaving] = useState(false);

  async function saveTitle() {
    if (!title.trim() || title.trim() === product.title) {
      setEditingTitle(false);
      return;
    }
    setSaving(true);
    try {
      await updateProductInfo(product.product_id, { title: title.trim() });
      await onUpdated();
      setEditingTitle(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }

  async function saveDesc() {
    if (description === (product.description || "")) {
      setEditingDesc(false);
      return;
    }
    setSaving(true);
    try {
      await updateProductInfo(product.product_id, { description });
      await onUpdated();
      setEditingDesc(false);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium text-gray-500">Title</p>
            {!editingTitle ? (
              <button
                className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-900"
                onClick={() => setEditingTitle(true)}
              >
                Edit
              </button>
            ) : null}
          </div>

          {!editingTitle ? (
            <p className="mt-1 truncate text-lg font-semibold text-gray-900">{product.title}</p>
          ) : (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/20"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
              />
              <div className="flex gap-2">
                <button
                  className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                  onClick={saveTitle}
                  disabled={saving}
                >
                  Save
                </button>
                <button
                  className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                  onClick={() => {
                    setTitle(product.title || "");
                    setEditingTitle(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-gray-500">Description</p>
          {!editingDesc ? (
            <button
              className="rounded-lg border bg-white px-3 py-1.5 text-xs font-medium text-gray-900"
              onClick={() => setEditingDesc(true)}
            >
              Edit
            </button>
          ) : null}
        </div>

        {!editingDesc ? (
          <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
            {product.description ? product.description : <span className="text-gray-400">No description</span>}
          </p>
        ) : (
          <div className="mt-2">
            <textarea
              className="min-h-[140px] w-full rounded-xl border px-3 py-2 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-black/20"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
            <div className="mt-2 flex gap-2">
              <button
                className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
                onClick={saveDesc}
                disabled={saving}
              >
                Save
              </button>
              <button
                className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-gray-900"
                onClick={() => {
                  setDescription(product.description || "");
                  setEditingDesc(false);
                }}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}