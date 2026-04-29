"use client";

import { cn } from "@/lib/utils";
import {
  FieldError,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

/* ================= TYPES ================= */

export type SelectOption =
  | { label: string; value: string }
  | { id: string; title: string };

interface Props<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  options: SelectOption[];
  register: UseFormRegister<T>;
  error?: FieldError;
  placeholder?: string;
  className?: string;
}

/* ================= COMPONENT ================= */

export default function SelectInput<T extends FieldValues>({
  label,
  name,
  options = [],
  register,
  error,
  placeholder = "Select option",
  className,
}: Props<T>) {
  // ✅ Normalize options
  const normalizedOptions = options.map((opt) =>
    "label" in opt
      ? opt
      : {
          label: opt.title,
          value: opt.id,
        }
  );

  // ✅ Remove duplicates + invalid
  const uniqueOptions = Array.from(
    new Map(
      normalizedOptions
        .filter((opt) => opt.value && opt.label)
        .map((opt) => [opt.value, opt])
    ).values()
  );

  return (
    <div className={cn("space-y-1", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}

    <select
  {...register(name)}
  defaultValue=""
  className={cn(
    "w-full px-3 py-2 rounded-xl border transition-all",
    
    // ✅ Glass UI Fix
    "bg-white/40 backdrop-blur-md text-black",
    "border-white/20 shadow-sm",

    "focus:outline-none focus:ring-2 focus:ring-orange-500",
    "hover:border-orange-400",
    error && "border-red-400"
  )}
>
  <option value="" disabled hidden className="text-black">
    {placeholder}
  </option>

  {uniqueOptions.map((opt) => (
    <option
      key={opt.value}
      value={opt.value}
      className="text-black bg-white"
    >
      {opt.label}
    </option>
  ))}
</select>

      {error && (
        <p className="text-xs text-red-500">
          {error.message}
        </p>
      )}
    </div>
  );
}