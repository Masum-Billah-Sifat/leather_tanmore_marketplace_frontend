"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";
import CategoryTreePicker, { CategoryNode } from "@/components/seller/CategoryTreePicker";
import MediaUploader, { UploadedMedia } from "@/components/seller/MediaUploader";
import VariantsEditor, { VariantDraft } from "@/components/seller/VariantsEditor";

type CreateProductPayload = {
  category_id: string;
  title: string;
  description: string;
  image_urls: string[];
  promo_video_url?: string;
  variants: any[];
};

function unwrapData<T>(res: any): T {
  // supports both: { success, data } and { status, data } shapes
  return (res?.data?.data ?? res?.data) as T;
}

function toInt(v: any): number {
  const n = typeof v === "string" ? parseInt(v, 10) : v;
  return Number.isFinite(n) ? n : 0;
}

export default function CreateProductForm() {
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [selectedLeafCategory, setSelectedLeafCategory] = useState<CategoryNode | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [images, setImages] = useState<UploadedMedia[]>([]);
  const [promoVideo, setPromoVideo] = useState<UploadedMedia | null>(null);

  const [variants, setVariants] = useState<VariantDraft[]>([
    VariantsEditor.createEmptyVariant(),
  ]);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const run = async () => {
      setLoadingCategories(true);
      try {
        const res = await axios.get("/api/categories/tree");
        const data = unwrapData<CategoryNode[]>(res);
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        handleApiError(err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };
    run();
  }, []);

  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    if (!selectedLeafCategory?.id) errs.push("Select a leaf category.");
    if (!title.trim()) errs.push("Title is required.");
    // Your API spec says description is required.
    // If you truly want optional, you can allow empty string, but backend may reject.
    if (!description.trim()) errs.push("Description is required.");
    if (images.length < 1) errs.push("At least one image is required.");
    if (!variants.length) errs.push("At least one variant is required.");

    variants.forEach((v, idx) => {
      if (!v.color.trim()) errs.push(`Variant #${idx + 1}: color is required.`);
      if (!v.size.trim()) errs.push(`Variant #${idx + 1}: size is required.`);
      if (!String(v.retail_price).trim()) errs.push(`Variant #${idx + 1}: retail price is required.`);
      if (!String(v.stock_quantity).trim()) errs.push(`Variant #${idx + 1}: stock quantity is required.`);
      if (!String(v.weight_grams).trim()) errs.push(`Variant #${idx + 1}: weight (grams) is required.`);

      if (v.retailDiscountEnabled) {
        if (!String(v.retail_discount).trim()) errs.push(`Variant #${idx + 1}: retail discount value is required.`);
        if (!v.retail_discount_type) errs.push(`Variant #${idx + 1}: retail discount type is required.`);
      }

      if (v.wholesaleEnabled) {
        if (!String(v.wholesale_price).trim()) errs.push(`Variant #${idx + 1}: wholesale price is required.`);
        if (!String(v.min_qty_wholesale).trim()) errs.push(`Variant #${idx + 1}: min wholesale qty is required.`);
        if (v.wholesaleDiscountEnabled) {
          if (!String(v.wholesale_discount).trim()) errs.push(`Variant #${idx + 1}: wholesale discount value is required.`);
          if (!v.wholesale_discount_type) errs.push(`Variant #${idx + 1}: wholesale discount type is required.`);
        }
      }
    });

    return errs;
  }, [selectedLeafCategory, title, description, images, variants]);

  const canSubmit = validationErrors.length === 0 && !submitting;

  const buildPayload = (): CreateProductPayload => {
    const payload: CreateProductPayload = {
      category_id: selectedLeafCategory!.id,
      title: title.trim(),
      description: description.trim(),
      image_urls: images.map((x) => x.media_url),
      variants: variants.map((v) => {
        const out: any = {
          color: v.color.trim(),
          size: v.size.trim(),
          retail_price: toInt(v.retail_price),
          in_stock: !!v.in_stock,
          stock_quantity: toInt(v.stock_quantity),
          weight_grams: toInt(v.weight_grams),
        };

        if (v.retailDiscountEnabled && v.retail_discount_type) {
          out.retail_discount = toInt(v.retail_discount);
          out.retail_discount_type = v.retail_discount_type;
        }

        if (v.wholesaleEnabled) {
          out.wholesale_price = toInt(v.wholesale_price);
          out.min_qty_wholesale = toInt(v.min_qty_wholesale);

          if (v.wholesaleDiscountEnabled && v.wholesale_discount_type) {
            out.wholesale_discount = toInt(v.wholesale_discount);
            out.wholesale_discount_type = v.wholesale_discount_type;
          }
        }

        return out;
      }),
    };

    if (promoVideo?.media_url) {
      payload.promo_video_url = promoVideo.media_url;
    }

    return payload;
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const payload = buildPayload();
      const res = await axios.post("/api/seller/products", payload);

      // success response spec: { success, message, data: { product } }
      const data = unwrapData<any>(res);
      const productId = data?.product?.id;

      alert(res.data?.message || "Product created successfully");

      // optional: redirect to seller dashboard or product detail
      // window.location.href = "/seller/dashboard";

      if (productId) {
        console.log("Created product:", productId);
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left: form */}
      <div className="lg:col-span-8">
        <div className="rounded-2xl border bg-white shadow-sm">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Product basics</h2>
            <p className="mt-1 text-sm text-gray-600">
              Select a leaf category, set title/description, then add media and variants.
            </p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="mt-2 rounded-2xl border p-4">
                {loadingCategories ? (
                  <p className="text-sm text-gray-500">Loading categories…</p>
                ) : (
                  <CategoryTreePicker
                    categories={categories}
                    selectedId={selectedLeafCategory?.id || null}
                    onSelectLeaf={(leaf) => setSelectedLeafCategory(leaf)}
                  />
                )}
                {selectedLeafCategory ? (
                  <p className="mt-3 text-xs text-gray-600">
                    Selected: <span className="font-medium">{selectedLeafCategory.name}</span>
                  </p>
                ) : null}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., Men's T-Shirt"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g., 100% cotton half sleeve"
              />
            </div>

            {/* Images */}
            <div>
              <h3 className="text-sm font-medium text-gray-700">
                Product images <span className="text-red-500">*</span>
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                First image will be treated as primary.
              </p>

              <div className="mt-3">
                <MediaUploader
                  label="Upload images"
                  mediaType="image"
                  multiple
                  accept="image/png,image/jpeg"
                  value={images}
                  onChange={setImages}
                />
              </div>
            </div>

            {/* Promo video */}
            <div>
              <h3 className="text-sm font-medium text-gray-700">Promo video (optional)</h3>
              <p className="mt-1 text-xs text-gray-500">MP4 only.</p>

              <div className="mt-3">
                <MediaUploader
                  label="Upload promo video"
                  mediaType="video"
                  multiple={false}
                  accept="video/mp4"
                  value={promoVideo ? [promoVideo] : []}
                  onChange={(arr) => setPromoVideo(arr[0] ?? null)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="mt-6 rounded-2xl border bg-white shadow-sm">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Variants</h2>
            <p className="mt-1 text-sm text-gray-600">
              Add at least one variant. Enable discounts and wholesale only if needed.
            </p>
          </div>

          <div className="px-6 py-6">
            <VariantsEditor value={variants} onChange={setVariants} />
          </div>
        </div>
      </div>

      {/* Right: summary + submit */}
      <div className="lg:col-span-4">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span className="font-medium">{selectedLeafCategory?.name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Images</span>
                <span className="font-medium">{images.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Variants</span>
                <span className="font-medium">{variants.length}</span>
              </div>
            </div>
          </div>

          {validationErrors.length > 0 ? (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-yellow-900">Fix these before submitting:</p>
              <ul className="mt-2 list-disc pl-5 text-sm text-yellow-800 space-y-1">
                {validationErrors.slice(0, 8).map((e) => (
                  <li key={e}>{e}</li>
                ))}
                {validationErrors.length > 8 ? (
                  <li>…and {validationErrors.length - 8} more</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white disabled:bg-gray-300"
          >
            {submitting ? "Creating…" : "Create Product"}
          </button>

          <p className="text-xs text-gray-500">
            If your seller profile isn’t approved, the backend will reject with <b>403</b>.
          </p>
        </div>
      </div>
    </div>
  );
}
