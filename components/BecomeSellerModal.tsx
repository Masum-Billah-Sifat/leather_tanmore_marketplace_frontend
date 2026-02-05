"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";

type Props = {
  open: boolean;
  onClose: () => void;
  // if user isn't logged in, we will show a login-first message
  isLoggedIn: boolean;
  onSuccess?: () => void;
};

type FormState = {
  seller_store_name: string;
  seller_contact_no: string;
  seller_whatsapp_contact_no: string;
  seller_website_link: string;
  seller_facebook_page_name: string;
  seller_email: string;
  seller_physical_location: string;
};

const initialForm: FormState = {
  seller_store_name: "",
  seller_contact_no: "",
  seller_whatsapp_contact_no: "",
  seller_website_link: "",
  seller_facebook_page_name: "",
  seller_email: "",
  seller_physical_location: "",
};

export default function BecomeSellerModal({
  open,
  onClose,
  isLoggedIn,
  onSuccess,
}: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    seller_store_name: false,
    seller_contact_no: false,
    seller_whatsapp_contact_no: false,
    seller_website_link: false,
    seller_facebook_page_name: false,
    seller_email: false,
    seller_physical_location: false,
  });

  useEffect(() => {
    if (!open) {
      setForm(initialForm);
      setSubmitting(false);
      setTouched({
        seller_store_name: false,
        seller_contact_no: false,
        seller_whatsapp_contact_no: false,
        seller_website_link: false,
        seller_facebook_page_name: false,
        seller_email: false,
        seller_physical_location: false,
      });
    }
  }, [open]);

  // Esc closes modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const requiredMissing = useMemo(() => {
    const missing: Partial<Record<keyof FormState, string>> = {};

    if (!form.seller_store_name.trim())
      missing.seller_store_name = "Store name is required";
    if (!form.seller_contact_no.trim())
      missing.seller_contact_no = "Contact number is required";
    if (!form.seller_whatsapp_contact_no.trim())
      missing.seller_whatsapp_contact_no = "WhatsApp number is required";
    if (!form.seller_physical_location.trim())
      missing.seller_physical_location = "Location is required";

    return missing;
  }, [form]);

  const hasErrors = Object.keys(requiredMissing).length > 0;

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const markTouched = <K extends keyof FormState>(key: K) => {
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const handleSubmit = async () => {

    markTouched("seller_store_name");
    markTouched("seller_contact_no");
    markTouched("seller_whatsapp_contact_no");
    markTouched("seller_physical_location");

    if (!isLoggedIn) return;
    if (hasErrors) return;

    setSubmitting(true);
    try {
      const payload: any = {
        seller_store_name: form.seller_store_name.trim(),
        seller_contact_no: form.seller_contact_no.trim(),
        seller_whatsapp_contact_no: form.seller_whatsapp_contact_no.trim(),
        seller_physical_location: form.seller_physical_location.trim(),
      };

      if (form.seller_email.trim())
        payload.seller_email = form.seller_email.trim();
      if (form.seller_website_link.trim())
        payload.seller_website_link = form.seller_website_link.trim();
      if (form.seller_facebook_page_name.trim())
        payload.seller_facebook_page_name =
          form.seller_facebook_page_name.trim();

      const res = await axios.post("/api/seller/profile/metadata", payload);

      // You can show a toast later; using alert now
      alert(res.data?.message || "Seller profile created successfully");

      onSuccess?.();
      onClose();
    } catch (err) {
        console.log(err)
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Become a Seller
              </h2>
              <p className="text-sm text-gray-500">
                Create your seller profile metadata to start listing products.
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="px-6 py-5">
            {!isLoggedIn ? (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                You need to login first to create a seller profile.
              </div>
            ) : null}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Store name (required) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Store name <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.seller_store_name}
                  onChange={(e) =>
                    setField("seller_store_name", e.target.value)
                  }
                  onBlur={() => markTouched("seller_store_name")}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., Moana Leather"
                />
                {touched.seller_store_name &&
                requiredMissing.seller_store_name ? (
                  <p className="mt-1 text-xs text-red-600">
                    {requiredMissing.seller_store_name}
                  </p>
                ) : null}
              </div>

              {/* Contact (required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact number <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.seller_contact_no}
                  onChange={(e) =>
                    setField("seller_contact_no", e.target.value)
                  }
                  onBlur={() => markTouched("seller_contact_no")}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., 017XXXXXXXX"
                />
                {touched.seller_contact_no &&
                requiredMissing.seller_contact_no ? (
                  <p className="mt-1 text-xs text-red-600">
                    {requiredMissing.seller_contact_no}
                  </p>
                ) : null}
              </div>

              {/* WhatsApp (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp number{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  value={form.seller_whatsapp_contact_no}
                  onChange={(e) =>
                    setField("seller_whatsapp_contact_no", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., 017XXXXXXXX"
                />
              </div>

              {/* Email (required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.seller_email}
                  onChange={(e) => setField("seller_email", e.target.value)}
                  onBlur={() => markTouched("seller_email")}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., moana@example.com"
                />
                {touched.seller_email && requiredMissing.seller_email ? (
                  <p className="mt-1 text-xs text-red-600">
                    {requiredMissing.seller_email}
                  </p>
                ) : null}
              </div>

              {/* Location (required) */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Physical location <span className="text-red-500">*</span>
                </label>
                <input
                  value={form.seller_physical_location}
                  onChange={(e) =>
                    setField("seller_physical_location", e.target.value)
                  }
                  onBlur={() => markTouched("seller_physical_location")}
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., Dhaka, Bangladesh"
                />
                {touched.seller_physical_location &&
                requiredMissing.seller_physical_location ? (
                  <p className="mt-1 text-xs text-red-600">
                    {requiredMissing.seller_physical_location}
                  </p>
                ) : null}
              </div>

              {/* Website (optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Website link <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  value={form.seller_website_link}
                  onChange={(e) =>
                    setField("seller_website_link", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="https://example.com"
                />
              </div>

              {/* Facebook page name (optional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Facebook page name{" "}
                  <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  value={form.seller_facebook_page_name}
                  onChange={(e) =>
                    setField("seller_facebook_page_name", e.target.value)
                  }
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g., MoanaFB"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isLoggedIn || submitting || hasErrors}
              className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-black disabled:bg-gray-300"
            >
              {submitting ? "Creating..." : "Create Seller Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
