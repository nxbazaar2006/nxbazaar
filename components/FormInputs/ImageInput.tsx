'use client';

import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { UploadButton } from "@/lib/uploadthing";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

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
};

/* ================= COMPONENT ================= */

export default function ImageInput<T extends FieldValues>({
  label,
  name,
  control,
  endpoint,
}: Props<T>) {

  const { field } = useController({
    name,
    control,
    defaultValue: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageUrl: string = field.value || "";

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
      field.onChange(uploadedUrl); // ✅ RHF update
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
      <label className="text-sm font-medium">
        {label}
      </label>

      {/* UPLOAD AREA */}
      {!imageUrl && (
        <div className="rounded-xl border p-6 text-center">

          <UploadButton
            endpoint={endpoint}
            appearance={{
              button: loading
                ? "bg-gray-400 text-white px-4 py-2 rounded"
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
            {loading
              ? "Uploading..."
              : "Upload image"}
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
        <div className="relative w-40 h-40 group">

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
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
          >
            Remove
          </button>

          {/* REPLACE */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100">

            <UploadButton
              endpoint={endpoint}
              appearance={{
                button: "text-xs bg-orange-500 text-white px-3 py-1 rounded",
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