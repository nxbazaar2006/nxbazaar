"use client";

import Image from "next/image";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";

import {
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

/* ================= TYPES ================= */

type UploadResponseItem = {
  ufsUrl?: string;
  serverData?: { url?: string };
};

type BaseProps = {
  label: string;
  endpoint: keyof OurFileRouter;
  previewSize?: number;
};

type FormProps<T extends FieldValues> = BaseProps & {
  name: Path<T>;
  imageUrl?: never;
  setImageUrl?: never;
};

type ControlledProps = BaseProps & {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  name?: never;
};

type Props<T extends FieldValues> = FormProps<T> | ControlledProps;

/* ================= COMPONENT ================= */

export default function ImageInput<T extends FieldValues>({
  label,
  endpoint,
  previewSize = 160,
  ...props
}: Props<T>) {
  const form = useFormContext<T>();
  const isControlled = "imageUrl" in props;

  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const imageUrl = isControlled
    ? props.imageUrl
    : ((form?.watch(props.name) ?? "") as string);

  const updateImageUrl = (url: string) => {
    if (isControlled) {
      props.setImageUrl?.(url);
      return;
    }

    if (!form) {
      throw new Error("ImageInput requires react-hook-form FormProvider or imageUrl/setImageUrl props");
    }

    form.setValue(props.name, url as PathValue<T, typeof props.name>, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  /* ================= UPLOAD ================= */

  const handleUploadComplete = (res: UploadResponseItem[]) => {
    const uploadedUrl =
      res?.[0]?.serverData?.url ??
      res?.[0]?.ufsUrl ??
      "";

    if (uploadedUrl && uploadedUrl !== imageUrl) {
      updateImageUrl(uploadedUrl);
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

      {/* Upload */}
      {!imageUrl && (
        <div className="rounded-2xl p-6 text-center">
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

      {/* Preview */}
      {imageUrl && (
        <div
          className="relative"
          style={{ width: previewSize, height: previewSize }}
        >
          <Image
            src={imageUrl}
            alt="preview"
            fill
            className="object-cover rounded-2xl"
          />

          {/* Remove */}
          <button
            type="button"
            onClick={() => updateImageUrl("")}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-2xl"
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
