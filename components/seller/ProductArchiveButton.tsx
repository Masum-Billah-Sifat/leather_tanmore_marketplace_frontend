"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { archiveProduct } from "@/api/sellerProductApi";
import { handleApiError } from "@/utils/handleApiError";

export default function ProductArchiveButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doArchive() {
    setLoading(true);
    try {
      await archiveProduct(productId);
      router.push("/seller/dashboard");
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        className="rounded-xl border bg-white px-4 py-2 text-sm font-medium text-red-700"
        onClick={() => setOpen(true)}
      >
        Archive product
      </button>

      <ConfirmModal
        open={open}
        title="Archive this product?"
        description="This will disable the product for customers. You can keep variants/media as-is."
        confirmText="Yes, archive"
        danger
        loading={loading}
        onConfirm={doArchive}
        onClose={() => setOpen(false)}
      />
    </>
  );
}