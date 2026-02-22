"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";
import Portal from "./ui/portal";

type Props = {
  open: boolean;
  onClose: () => void;
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

  // ✅ Match backend required fields
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

  const inputClass = (hasError?: boolean) =>
    [
      "mt-1 w-full rounded-2xl border px-4 py-3 text-sm",
      "bg-white text-[rgb(var(--text))] placeholder:text-black/35",
      "focus:outline-none focus:ring-4",
      hasError
        ? "border-red-500/40 focus:ring-red-500/15"
        : "border-black/10 focus:ring-[rgb(var(--brand))]/15",
    ].join(" ");

  const handleSubmit = async () => {
    // touch required fields
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

      // ✅ Optional fields only if non-empty
      if (form.seller_email.trim())
        payload.seller_email = form.seller_email.trim();
      if (form.seller_website_link.trim())
        payload.seller_website_link = form.seller_website_link.trim();
      if (form.seller_facebook_page_name.trim())
        payload.seller_facebook_page_name =
          form.seller_facebook_page_name.trim();

      const res = await axios.post("/api/seller/profile/metadata", payload);

      alert(res.data?.message || "Seller profile created successfully");

      onSuccess?.();
      onClose();
    } catch (err) {
      console.log(err);
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => {
            if (submitting) return;
            onClose();
          }}
        />

        {/* ✅ Scrollable overlay so content never gets cut off */}
        <div className="absolute inset-0 overflow-y-auto">
          <div className="min-h-[100dvh] p-4 sm:p-6 flex items-start sm:items-center justify-center">
            <div
              className={[
                "w-full max-w-3xl",
                "rounded-3xl border border-black/10 bg-[rgb(var(--surface))] shadow-xl",
                "overflow-hidden",
                // ✅ keep the card inside viewport
                "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3rem)]",
                "flex flex-col",
              ].join(" ")}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-black/10 bg-black/[0.02]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-display text-lg font-semibold text-[rgb(var(--text))]">
                      Become a Seller
                    </div>
                    <div className="mt-1 text-sm text-[rgb(var(--muted))]">
                      Create your seller profile metadata to start listing
                      products.
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    disabled={submitting}
                    className="rounded-2xl px-3 py-2 text-sm text-[rgb(var(--muted))] hover:bg-black/5 disabled:opacity-40"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* ✅ Body scrolls if needed */}
              <div className="px-6 py-5 overflow-y-auto">
                {!isLoggedIn ? (
                  <div className="rounded-2xl border border-[rgb(var(--brand))]/20 bg-[rgb(var(--brand))]/10 p-4 text-sm text-[rgb(var(--brand-strong))]">
                    You need to login first to create a seller profile.
                  </div>
                ) : null}

                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Store name (required) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      Store name <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.seller_store_name}
                      onChange={(e) =>
                        setField("seller_store_name", e.target.value)
                      }
                      onBlur={() => markTouched("seller_store_name")}
                      className={inputClass(
                        !!(
                          touched.seller_store_name &&
                          requiredMissing.seller_store_name
                        ),
                      )}
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
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      Contact number <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.seller_contact_no}
                      onChange={(e) =>
                        setField("seller_contact_no", e.target.value)
                      }
                      onBlur={() => markTouched("seller_contact_no")}
                      className={inputClass(
                        !!(
                          touched.seller_contact_no &&
                          requiredMissing.seller_contact_no
                        ),
                      )}
                      placeholder="e.g., 017XXXXXXXX"
                    />
                    {touched.seller_contact_no &&
                    requiredMissing.seller_contact_no ? (
                      <p className="mt-1 text-xs text-red-600">
                        {requiredMissing.seller_contact_no}
                      </p>
                    ) : null}
                  </div>

                  {/* WhatsApp (required by backend) */}
                  <div>
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      WhatsApp number <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.seller_whatsapp_contact_no}
                      onChange={(e) =>
                        setField("seller_whatsapp_contact_no", e.target.value)
                      }
                      onBlur={() => markTouched("seller_whatsapp_contact_no")}
                      className={inputClass(
                        !!(
                          touched.seller_whatsapp_contact_no &&
                          requiredMissing.seller_whatsapp_contact_no
                        ),
                      )}
                      placeholder="e.g., 017XXXXXXXX"
                    />
                    {touched.seller_whatsapp_contact_no &&
                    requiredMissing.seller_whatsapp_contact_no ? (
                      <p className="mt-1 text-xs text-red-600">
                        {requiredMissing.seller_whatsapp_contact_no}
                      </p>
                    ) : null}
                  </div>

                  {/* Email (optional by backend) */}
                  <div>
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      Email <span className="text-black/35">(optional)</span>
                    </label>
                    <input
                      value={form.seller_email}
                      onChange={(e) => setField("seller_email", e.target.value)}
                      className={inputClass(false)}
                      placeholder="e.g., moana@example.com"
                    />
                  </div>

                  {/* Location (required) */}
                  <div>
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      Physical location <span className="text-red-500">*</span>
                    </label>
                    <input
                      value={form.seller_physical_location}
                      onChange={(e) =>
                        setField("seller_physical_location", e.target.value)
                      }
                      onBlur={() => markTouched("seller_physical_location")}
                      className={inputClass(
                        !!(
                          touched.seller_physical_location &&
                          requiredMissing.seller_physical_location
                        ),
                      )}
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
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      Website link{" "}
                      <span className="text-black/35">(optional)</span>
                    </label>
                    <input
                      value={form.seller_website_link}
                      onChange={(e) =>
                        setField("seller_website_link", e.target.value)
                      }
                      className={inputClass(false)}
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Facebook page (optional) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-[rgb(var(--text))]">
                      Facebook page name{" "}
                      <span className="text-black/35">(optional)</span>
                    </label>
                    <input
                      value={form.seller_facebook_page_name}
                      onChange={(e) =>
                        setField("seller_facebook_page_name", e.target.value)
                      }
                      className={inputClass(false)}
                      placeholder="e.g., MoanaFB"
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-5 border-t border-black/10 bg-black/[0.02] flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="rounded-2xl px-4 py-2 text-sm font-semibold text-[rgb(var(--text))] hover:bg-black/5 disabled:opacity-40"
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!isLoggedIn || submitting || hasErrors}
                  className="rounded-2xl bg-[rgb(var(--brand-strong))] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-40"
                >
                  {submitting ? "Creating..." : "Create Seller Profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Portal>
  );
}
