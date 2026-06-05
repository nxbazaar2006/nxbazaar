"use client";

import { cn } from "@/lib/utils";
import {
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

/* ================= TYPES ================= */

export type SelectOption =
  | { label: string; value: string }
  | { id: string; title: string };

interface Props<T extends FieldValues> {
  label?: string;
  name: Path<T>;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
}

/* ================= COMPONENT ================= */

export default function SelectInput<T extends FieldValues>({
  label,
  name,
  options = [],
  placeholder = "Select option",
  className,
}: Props<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name]?.message as string | undefined;

  // ✅ Normalize options
  const normalizedOptions = options.map((opt) =>
    "label" in opt
      ? opt
      : {
          label: opt.title,
          value: opt.id,
        }
  );

  // ✅ Remove duplicates
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
          "w-full px-3 py-2 rounded-md border transition-all",
          "bg-transparent text-slate-950 dark:text-white",
          "border-slate-200 shadow-sm dark:border-white/10",
          "focus:outline-none focus:ring-2 focus:ring-orange-500/20",
          "hover:border-orange-400 focus:border-orange-400",
          error && "border-red-400"
        )}
      >
        <option className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white" value="" disabled hidden>
          {placeholder}
        </option>

        {uniqueOptions.map((opt) => (
          <option className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white" key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
