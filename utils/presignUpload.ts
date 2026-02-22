// src/utils/presignUpload.ts
import axios from "@/utils/axios";
import { unwrapData } from "@/utils/unWrapData";

type PresignResp = {
  upload_url: string;
  media_url: string;
};

function getExt(filename: string) {
  const parts = filename.split(".");
  return (parts[parts.length - 1] || "").toLowerCase();
}

export async function presignAndUpload(file: File, mediaType: "image" | "video") {
  const file_extension = getExt(file.name);

  const res = await axios.post("/api/media/presign-upload", {
    media_type: mediaType,
    file_extension,
  });

  const data = unwrapData<{ upload_url: string; media_url: string }>(res) as PresignResp;

  // Most presigned URLs expect PUT.
  // We try with Content-Type first; if that fails, retry without headers.
  let up = await fetch(data.upload_url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });

  if (!up.ok) {
    up = await fetch(data.upload_url, { method: "PUT", body: file });
  }

  if (!up.ok) {
    const txt = await up.text().catch(() => "");
    throw new Error(`Upload failed (${up.status}). ${txt}`.trim());
  }

  return { media_url: data.media_url };
}