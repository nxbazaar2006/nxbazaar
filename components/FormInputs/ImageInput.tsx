"use client";

import Image from "next/image";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { useState } from "react";

type Props = {
  label: string;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  endpoint: keyof OurFileRouter;
};

export default function ImageInput({
  label,
  imageUrl,
  setImageUrl,
  endpoint,
}: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-3">
      {/* LABEL */}
      <label className="text-sm font-medium text-black dark:text-black">
        {label}
      </label>

      {/* UPLOAD AREA */}
      {!imageUrl && (
        <div className="border-1 border-black dark:border-slate-600 rounded-xl p-6 text-center hover:border-orange-400 transition">
          
          <UploadButton<OurFileRouter>
            endpoint={endpoint}
            onUploadBegin={() => setLoading(true)}
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                setImageUrl(res[0].ufsUrl);
              }
              setLoading(false);
            }}
            onUploadError={(error: Error) => {
              alert(`Upload failed: ${error.message}`);
              setLoading(false);
            }}
          />

          <p className="text-xs text-gray-500 mt-2">
            {loading ? "Uploading..." : "Click to upload image"}
          </p>
        </div>
      )}

      {/* PREVIEW */}
      {imageUrl && (
        <div className="relative w-40 h-40 group">
          <Image
            src={imageUrl}
            alt="preview"
            fill
            className="object-cover rounded-xl border dark:border-slate-700"
          />

          {/* REMOVE BUTTON */}
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
          >
            Remove
          </button>

          {/* REPLACE BUTTON */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition">
            <UploadButton<OurFileRouter>
              endpoint={endpoint}
              appearance={{
                button:
                  "text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded",
              }}
              onClientUploadComplete={(res) => {
                if (res && res.length > 0) {
                  setImageUrl(res[0].ufsUrl);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
