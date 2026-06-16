import Image from "next/image";
import { Row } from "@tanstack/react-table";

interface ImageColumnProps<TData extends object> {
  row: Row<TData>;
  accessorKey: keyof TData & string;
  alt?: string;
  size?: number;
}

export default function ImageColumn<TData extends object>({
  row,
  accessorKey,
  alt = "image",
  size = 48,
}: ImageColumnProps<TData>) {
  const value = row.original[accessorKey];

  const imageUrl =
    typeof value === "string" && value.trim().length > 0
      ? value
      : undefined;

  if (!imageUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border bg-card text-card-foreground shadow-sm text-xs text-muted-foreground"
        style={{ width: size, height: size }}
      >
        —
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm"
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
      />
    </div>
  );
}