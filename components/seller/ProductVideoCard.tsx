"use client";

import { useMemo, useRef, useState } from "react";
import type { SellerProductDetail } from "@/types/sellerProductDetail";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { handleApiError } from "@/utils/handleApiError";
import { addProductMedia, archiveProductMedia } from "@/api/sellerProductApi";
import { presignAndUpload } from "@/utils/presignUpload";

function extractActiveVideo(product: any) {
  if (!product) return null;

  const isVideoType = (t: any) => t === "promo_video" || t === "video";

  // direct fields (if present)
  if (product.promo_video_media_item && !product.promo_video_media_item.is_archived && isVideoType(product.promo_video_media_item.media_type)) {
    return product.promo_video_media_item;
  }

  if (Array.isArray(product.promo_video_media_items)) {
    const v = product.promo_video_media_items.find((x: any) => x && !x.is_archived && isVideoType(x.media_type));
    if (v) return v;
  }

  // fallback: scan every key for media-like objects/arrays
  for (const v of Object.values(product)) {
    if (Array.isArray(v)) {
      const found = v.find((x: any) => x && typeof x === "object" && !x.is_archived && isVideoType(x.media_type) && x.media_url);
      if (found) return found;
    } else if (v && typeof v === "object") {
      if (!v.is_archived && isVideoType((v as any).media_type) && (v as any).media_url) return v;
    }
  }

  // very last fallback: if you ever return a raw URL in future
  if (typeof product.promo_video_url === "string" && product.promo_video_url.length > 0) {
    return { media_id: null, media_type: "promo_video", media_url: product.promo_video_url, is_archived: false };
  }

  return null;
}

export default function ProductVideoCard({
  product,
  onUpdated,
}: {
  product: SellerProductDetail;
  onUpdated: () => Promise<void>;
}) {
  const productId = product.product_id;

  const activeVideo = useMemo(() => extractActiveVideo(product), [product]);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [working, setWorking] = useState(false);

  async function uploadVideo(file: File) {
    setWorking(true);
    try {
      const { media_url } = await presignAndUpload(file, "video");
      await addProductMedia(productId, { media_url, media_type: "video" });
      await onUpdated();
    } catch (err) {
      handleApiError(err);
    } finally {
      setWorking(false);
    }
  }

  async function deleteVideo() {
    if (!activeVideo?.media_id) {
      alert("Cannot delete video because media_id is missing from the product detail response.");
      return;
    }
    setWorking(true);
    try {
      await archiveProductMedia(productId, activeVideo.media_id, "video");
      await onUpdated();
    } catch (err) {
      handleApiError(err);
    } finally {
      setWorking(false);
      setOpenDelete(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">Promo video</p>
          {!activeVideo ? (
            <p className="mt-1 text-sm text-gray-600">
              Add a short video—buyers trust products more when they can see it in motion.
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-600">Your promo video is active.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) uploadVideo(f);
            }}
          />

          {!activeVideo ? (
            <button
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              onClick={() => fileRef.current?.click()}
              disabled={working}
            >
              {working ? "Working..." : "Add video"}
            </button>
          ) : (
            <button
              className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-red-700 disabled:opacity-60"
              onClick={() => setOpenDelete(true)}
              disabled={working || !activeVideo.media_id}
              title={!activeVideo.media_id ? "media_id missing in response" : ""}
            >
              Delete video
            </button>
          )}
        </div>
      </div>

      {activeVideo ? (
        <div className="mt-4 overflow-hidden rounded-2xl border bg-black">
          <div className="aspect-video w-full">
            <video
              key={activeVideo.media_url}  // ✅ forces reload when URL changes
              className="h-full w-full"
              controls
              src={activeVideo.media_url}
            />
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-900">No promo video yet</p>
          <p className="mt-1 text-sm text-gray-600">A 10–20s clip usually improves conversion.</p>
        </div>
      )}

      <ConfirmModal
        open={openDelete}
        title="Delete promo video?"
        description="This will archive the promo video."
        confirmText="Yes, delete"
        danger
        loading={working}
        onConfirm={deleteVideo}
        onClose={() => setOpenDelete(false)}
      />
    </div>
  );
}