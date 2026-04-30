"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";

import {
  FieldValues,
  Path,
  Control,
  useController,
  useFormContext,
} from "react-hook-form";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

/* ================= TYPES ================= */

type UploadResponseItem = {
  ufsUrl?: string;
  serverData?: { url?: string };
};

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control?: Control<T>;
  endpoint: keyof OurFileRouter;
  previewSize?: number;
};

/* ================= COMPONENT ================= */

export default function ImageInput<T extends FieldValues>({
  label,
  name,
  control,
  endpoint,
  previewSize = 160,
}: Props<T>) {

  // ✅ SAFE: context optional रखो
  const methods = useFormContext<T>();
  const resolvedControl = control ?? methods?.control;

  // ❌ अगर दोनों नहीं मिले → clear error
  if (!resolvedControl) {
    throw new Error(
      `ImageInput "${String(
        name
      )}" must receive control or be inside FormProvider`
    );
  }

  const { field } = useController({
    name,
    control: resolvedControl,
  });

  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageUrl = (field.value ?? "") as string;

  /* ================= UPLOAD ================= */

  const handleUploadComplete = (res: UploadResponseItem[]) => {
    const uploadedUrl =
      res?.[0]?.serverData?.url ??
      res?.[0]?.ufsUrl ??
      "";

    if (uploadedUrl && uploadedUrl !== imageUrl) {
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
      <label className="text-sm font-medium block">{label}</label>

      {/* ================= UPLOAD ================= */}
      {!imageUrl && (
        <div className="border rounded-xl p-6 text-center">
          <UploadDropzone
            endpoint={endpoint}
            disabled={loading}
            onUploadBegin={() => {
              setLoading(true);
              setUploadError("");
            }}
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
          />

          {loading && (
            <p className="text-xs flex justify-center gap-2 mt-2">
              <Loader2 className="h-3 w-3 animate-spin" />
              Uploading...
            </p>
          )}

          {uploadError && (
            <p className="text-xs text-red-500 mt-2">
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* ================= PREVIEW ================= */}
      {imageUrl && (
        <div
          className="relative"
          style={{ width: previewSize, height: previewSize }}
        >
          <Image
            src={imageUrl}
            alt="preview"
            fill
            className="object-cover rounded"
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => field.onChange("")}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
          >
            Remove
          </button>

          {/* Replace */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <UploadButton
              endpoint={endpoint}
              disabled={loading}
              onUploadBegin={() => {
                setLoading(true);
                setUploadError("");
              }}
              onClientUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
            />
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}