'use client';

import Image from "next/image";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";
import { Loader2 } from "lucide-react";

import {
  Control,
  FieldValues,
  Path,
  useController,
} from "react-hook-form";

/* ================= TYPES ================= */

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  endpoint: keyof OurFileRouter;
  previewSize?: number; // ✅ reusable
};

/* ================= COMPONENT ================= */

export default function ImageInput<T extends FieldValues>({
  label,
  name,
  control,
  endpoint,
  previewSize = 160,
}: Props<T>) {

  const { field } = useController({
    name,
    control,
    defaultValue: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageUrl = (field.value ?? "") as string;

  /* ================= UPLOAD ================= */

  const handleUploadComplete = (
    res: Array<{
      ufsUrl?: string;
      serverData?: { url?: string };
    }>
  ) => {
    const uploadedUrl =
      res?.[0]?.serverData?.url ??
      res?.[0]?.ufsUrl ??
      "";

    if (uploadedUrl) {
      field.onChange(uploadedUrl);
      setUploadError("");
    }

    setLoading(false);
  };

  const handleUploadError = (error: Error) => {
    setUploadError(error.message);
    setLoading(false);
  };

  return (
    <div className="space-y-3">

      {/* LABEL */}
      <label className="text-sm font-medium block">
        {label}
      </label>

      {/* UPLOAD AREA */}
      {!imageUrl && (
        <div className="border border-white dark:border-slate-600 rounded-xl p-6 text-center hover:border-orange-400 transition">

          <UploadDropzone
            endpoint={endpoint}
            disabled={loading}
            appearance={{
              button: loading
                ? "bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded",
              allowedContent: "hidden",
            }}
            content={{
              button: loading ? "Uploading..." : "Upload image",
            }}
            onUploadBegin={() => {
              setLoading(true);
              setUploadError("");
            }}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />

          <p className="mt-2 text-xs text-gray-500 flex justify-center gap-2">
            {loading && <Loader2 className="h-3 w-3 animate-spin" />}
            {loading ? "Uploading..." : "Upload image"}
          </p>

          {uploadError && (
            <p className="text-xs text-red-500">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* PREVIEW */}
      {imageUrl && (
        <div
          className="relative group"
          style={{
            width: previewSize,
            height: previewSize,
          }}
        >

          <Image
            src={imageUrl}
            alt="preview"
            fill
            className="object-cover rounded"
          />

          {/* REMOVE */}
          <button
            type="button"
            onClick={() => field.onChange("")}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            Remove
          </button>

          {/* REPLACE BUTTON */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition">
            <UploadButton
              endpoint={endpoint}
              disabled={loading}
              appearance={{
                button: loading
                  ? "text-xs bg-gray-400 text-white px-3 py-1 rounded cursor-not-allowed"
                  : "text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded",
                allowedContent: "hidden",
              }}
              content={{
                button: loading ? "Uploading..." : "Replace",
              }}
              onUploadBegin={() => {
                setLoading(true);
                setUploadError("");
              }}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>

          {/* LOADER OVERLAY */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          )}
        </div>
      )}

    </div>
  );
}