"use client";

import { useRef, useState } from "react";
import axios from "@/utils/axios";
import { handleApiError } from "@/utils/handleApiError";

export type UploadedMedia = {
  media_url: string;     // CDN URL returned by backend
  file_name: string;
  kind: "image" | "video";
};

type Props = {
  label: string;
  mediaType: "image" | "video";
  multiple: boolean;
  accept: string;
  value: UploadedMedia[];
  onChange: (next: UploadedMedia[]) => void;
};

function getExt(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

async function presign(mediaType: "image" | "video", fileExtension: string) {
  const res = await axios.post("/api/media/presign-upload", {
    media_type: mediaType,
    file_extension: fileExtension,
  });
  // response: { success, data: { upload_url, media_url } } (or status/data)
  const data = res?.data?.data ?? res?.data?.data ?? res?.data;
  return data?.data ?? data; // tolerate inconsistencies
}

export default function MediaUploader({
  label,
  mediaType,
  multiple,
  accept,
  value,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const removeAt = (idx: number) => {
    const next = [...value];
    next.splice(idx, 1);
    onChange(next);
  };

  const uploadOne = async (file: File) => {
    const ext = getExt(file.name);
    if (!ext) throw new Error("File extension missing");

    const presigned = await presign(mediaType, ext);
    const uploadUrl = presigned?.upload_url;
    const mediaUrl = presigned?.media_url;

    if (!uploadUrl || !mediaUrl) {
      throw new Error("Presign response missing upload_url/media_url");
    }

    // IMPORTANT: Use fetch (no axios instance) so we DON'T attach Authorization/fingerprint headers.
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type || (mediaType === "image" ? "image/jpeg" : "video/mp4"),
      },
    });

    if (!putRes.ok) {
      throw new Error(`Upload failed (${putRes.status})`);
    }

    return {
      media_url: mediaUrl,
      file_name: file.name,
      kind: mediaType,
    } as UploadedMedia;
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const picked = Array.from(files);
    const batch = multiple ? picked : [picked[0]];

    setUploading(true);
    try {
      const results: UploadedMedia[] = [];
      for (const f of batch) {
        const uploaded = await uploadOne(f);
        results.push(uploaded);
      }

      const next = multiple ? [...value, ...results] : results;
      onChange(next);
    } catch (err) {
      handleApiError(err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-xs text-gray-500">
            {mediaType === "image" ? "JPG/PNG supported." : "MP4 supported."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={(e) => onPickFiles(e.target.files)}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="rounded-xl border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Choose file"}
          </button>
        </div>
      </div>

      {value.length > 0 ? (
        <div className="mt-4 space-y-2">
          {value.map((m, idx) => (
            <div key={m.media_url + idx} className="flex items-center justify-between rounded-xl border px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm text-gray-900">{m.file_name}</p>
                <p className="truncate text-xs text-gray-500">{m.media_url}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="rounded-lg px-3 py-2 text-xs text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-gray-500">No files uploaded yet.</p>
      )}
    </div>
  );
}
