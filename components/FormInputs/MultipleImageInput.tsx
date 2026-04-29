"use client";

import Image from "next/image";
import { UploadButton } from "@/lib/uploadthing";
import { UseFormSetValue } from "react-hook-form";
import { ProductInput } from "@/lib/validators/productSchema";

type Props = {
  label: string;
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  endpoint: Endpoint;

  setValue: UseFormSetValue<ProductInput>; // ✅ type-safe
};

export default function MultipleImageInput({
  label,
  imageUrls,
  setImageUrls,
  endpoint,
  setValue,
}: Props) {

  function removeImage(index: number) {
    const updated = imageUrls.filter((_, i) => i !== index);

    setImageUrls(updated);
    setValue(
      "images",
      updated.map((url, imageIndex) => ({
        url,
        isPrimary: imageIndex === 0,
      }))
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium">{label}</label>

      {/* Preview */}
      <div className="flex gap-3 flex-wrap">
        {imageUrls.map((img, i) => (
          <div key={i} className="relative">
            <Image
              src={img}
              width={100}
              height={100}
              alt="product"
              className="w-24 h-24 object-cover rounded-md border"
            />

            <button
              type="button"
              onClick={() => removeImage(i)}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Upload */}
      <UploadButton
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          const urls = res.map((item) => item.serverData.url);

          const updated = [...imageUrls, ...urls];

          setImageUrls(updated);
          setValue(
            "images",
            updated.map((url, imageIndex) => ({
              url,
              isPrimary: imageIndex === 0,
            }))
          );
        }}
        onUploadError={(error: Error) => {
          alert(`Upload failed: ${error.message}`);
        }}
      />
    </div>
  );
}
