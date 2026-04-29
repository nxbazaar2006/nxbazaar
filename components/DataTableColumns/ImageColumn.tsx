import Image from "next/image";
import { Row } from "@tanstack/react-table";

interface Props<TData> {
  row: Row<TData>;
  accessorKey: keyof TData; // ✅ type-safe key
}

export default function ImageColumn<TData extends Record<string, unknown>>({
  row,
  accessorKey,
}: Props<TData>) {
  // ✅ fully type-safe access
  const value = row.original[accessorKey];

  // ensure string
  const imageUrl =
    typeof value === "string" && value.length > 0 ? value : undefined;

  if (!imageUrl) {
    return (
      <div className="w-10 h-10 flex items-center justify-center text-xs text-gray-400 bg-gray-100 rounded-full">
        —
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12 rounded-xl overflow-hidden 
                    backdrop-blur-md bg-white/30 border border-white/20 shadow-lg">
      <Image
        src={imageUrl}
        alt="category"
        fill
        sizes="48px"
        className="object-cover"
      />
    </div>
  );
}