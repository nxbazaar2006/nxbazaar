"use client";

import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

import {
  FieldValues,
  Path,
  PathValue,
  useController,
  useFormContext,
} from "react-hook-form";

type UploadResponseItem = {
  ufsUrl?: string;
  serverData?: { url?: string };
};

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>; // e.g. "images"
  endpoint: keyof OurFileRouter;
};

export default function MultipleImageInput<T extends FieldValues>({
  label,
  name,
  endpoint,
}: Props<T>) {
  const { control } = useFormContext<T>();

  const { field } = useController({
    name,
    control,
    defaultValue: [] as PathValue<T, Path<T>>,
  });

  const [loading, setLoading] = useState(false);

  const images: { url: string; isPrimary?: boolean }[] =
    field.value || [];

  /* ================= REMOVE ================= */
  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);

    field.onChange(
      updated.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
      }))
    );
  }

  /* ================= UPLOAD ================= */
  function handleUpload(res: UploadResponseItem[]) {
    const urls =
      res
        ?.map((item) => item.serverData?.url ?? item.ufsUrl)
        .filter(Boolean) as string[];

    const updated = [
      ...images,
      ...urls.map((url) => ({ url })),
    ];

    field.onChange(
      updated.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
      }))
    );

    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">
        {label}
      </label>

      {/* Preview */}
      <div className="flex gap-3 flex-wrap">
        {images.map((img, i) => (
          <div key={i} className="relative">
            <Image
              src={img.url}
              width={100}
              height={100}
              alt="product"
              className="w-24 h-24 object-cover rounded-md border-4 border-white"
            />

            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
            >
              ✕
            </button>

            {img.isPrimary && (
              <span className="absolute bottom-1 left-1 text-[10px] bg-black text-white px-1 rounded">
                Primary
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Upload */}
      <UploadButton
        endpoint={endpoint}
        disabled={loading}
        onUploadBegin={() => setLoading(true)}
        onClientUploadComplete={handleUpload}
        onUploadError={(err: Error) => {
          console.error(err);
          setLoading(false);
        }}
      />
    </div>
  );
}
