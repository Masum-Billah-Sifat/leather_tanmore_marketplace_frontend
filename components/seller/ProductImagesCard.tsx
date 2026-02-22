"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { SellerProductDetail } from "@/types/sellerProductDetail";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { handleApiError } from "@/utils/handleApiError";
import { addProductMedia, archiveProductMedia, setPrimaryImage } from "@/api/sellerProductApi";
import { presignAndUpload } from "@/utils/presignUpload";

export default function ProductImagesCard({
  product,
  onUpdated,
}: {
  product: SellerProductDetail;
  onUpdated: () => Promise<void>;
}) {
  const productId = product.product_id;

  const activeImages = useMemo(() => {
    const list = product.image_media_items || [];
    return list.filter((x) => !x.is_archived);
  }, [product.image_media_items]);

  const primaryId =
    product.primary_image_item?.media_id ||
    activeImages.find((x) => x.is_primary)?.media_id ||
    (activeImages[0]?.media_id ?? null);

  const primaryItem = useMemo(() => {
    if (!primaryId) return null;
    return activeImages.find((x) => x.media_id === primaryId) || null;
  }, [activeImages, primaryId]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ media_id: string; media_url: string } | null>(null);
  const [working, setWorking] = useState(false);

  const canDeleteAny = activeImages.length > 1; // cannot delete last image

  async function uploadNewImage(file: File) {
    setWorking(true);
    try {
      const { media_url } = await presignAndUpload(file, "image");
      await addProductMedia(productId, { media_url, media_type: "image" });
      await onUpdated();
    } catch (err) {
      handleApiError(err);
    } finally {
      setWorking(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setWorking(true);
    try {
      await archiveProductMedia(productId, deleteTarget.media_id, "image");
      await onUpdated();
    } catch (err) {
      handleApiError(err);
    } finally {
      setWorking(false);
      setDeleteTarget(null);
    }
  }

  async function makePrimary(media_id: string) {
    if (media_id === primaryId) return;
    setWorking(true);
    try {
      await setPrimaryImage(productId, media_id);
      await onUpdated();
    } catch (err) {
      handleApiError(err);
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Images</p>
          <p className="mt-1 text-sm text-gray-600">Your primary image is used on cards and listings.</p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) uploadNewImage(f);
            }}
          />
          <button
            className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            onClick={() => fileRef.current?.click()}
            disabled={working}
          >
            {working ? "Working..." : "Add image"}
          </button>
        </div>
      </div>

      {/* Primary (hero) image */}
      <div className="mt-4 overflow-hidden rounded-2xl border bg-gray-50">
        <div className="relative aspect-[16/10] w-full">
          {primaryItem?.media_url ? (
            <Image src={primaryItem.media_url} alt="Primary product image" fill className="object-cover" unoptimized />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">No images</div>
          )}

          {primaryItem ? (
            <div className="absolute left-3 top-3">
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Primary
              </span>
            </div>
          ) : null}
        </div>

        {/* Info bar (no delete primary) */}
        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            {activeImages.length} image{activeImages.length === 1 ? "" : "s"} • Primary image cannot be deleted • You can’t delete the last image
          </p>
        </div>
      </div>

      {/* Thumbnails */}
      {activeImages.length > 0 ? (
        <div className="mt-4">
          <p className="text-xs font-medium text-gray-500">All images</p>

          <div className="mt-2 flex gap-3 overflow-x-auto pb-2">
            {activeImages.map((img) => {
              const isPrimary = img.media_id === primaryId;
              const canDeleteThis = canDeleteAny && !isPrimary; // ✅ only non-primary

              return (
                <div key={img.media_id} className="w-44 flex-shrink-0 overflow-hidden rounded-2xl border bg-white">
                  <div className="relative aspect-[4/3] w-full bg-gray-50">
                    <Image src={img.media_url} alt="Product image" fill className="object-cover" unoptimized />
                    {isPrimary ? (
                      <div className="absolute left-2 top-2">
                        <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                          Primary
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-2">
                    <div className="flex flex-col gap-2">
                      {!isPrimary ? (
                        <button
                          className="w-full rounded-xl bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                          onClick={() => makePrimary(img.media_id)}
                          disabled={working}
                        >
                          Set as primary
                        </button>
                      ) : (
                        <button
                          className="w-full cursor-not-allowed rounded-xl border bg-gray-50 px-3 py-2 text-sm font-medium text-gray-500"
                          disabled
                        >
                          Primary
                        </button>
                      )}

                      {canDeleteThis ? (
                        <button
                          className="w-full rounded-xl border bg-white px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
                          onClick={() => setDeleteTarget({ media_id: img.media_id, media_url: img.media_url })}
                          disabled={working}
                        >
                          Delete
                        </button>
                      ) : (
                        <div className="w-full rounded-xl border bg-gray-50 px-3 py-2 text-center text-sm font-medium text-gray-400">
                          {isPrimary ? "Protected" : "Required"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="mt-2 text-xs text-gray-500">Tip: choose a primary image that looks best on listing cards.</p>
        </div>
      ) : null}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete this image?"
        description="This will archive the image. Primary image cannot be deleted, and you cannot delete the last remaining image."
        confirmText="Yes, delete"
        danger
        loading={working}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}