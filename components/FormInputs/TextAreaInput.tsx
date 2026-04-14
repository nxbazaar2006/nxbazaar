"use client";

import {
  FieldErrors,
  UseFormRegister,
  FieldValues,
  Path,
  RegisterOptions,
  get,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  rules?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

export default function TextareaInput<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  rules,
  placeholder,
  rows = 4,
  required = false,
}: Props<T>) {
  const error = get(errors, name); // ✅ FIXED

  return (
    <div className="space-y-1.5">
      {/* 🔥 Label */}
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* 🔥 Textarea */}
      <textarea
        rows={rows}
        placeholder={placeholder}
        {...register(name, rules)}
        className={`
          w-full px-4 py-3
          rounded-2xl

           dark:bg-gray-900/80
          backdrop-blur

          border
          ${error
            ? "border-red-500 focus:ring-red-500/20"
            : "border-gray-200 dark:border-gray-700"}

          text-gray-900 dark:text-gray-100
          placeholder:text-gray-400

          outline-none
          transition-all duration-300 ease-in-out

          shadow-sm
          hover:shadow-md

          focus:ring-2 focus:ring-black/10
          focus:border-black

          dark:focus:ring-white/10
          dark:focus:border-white

          resize-none
        `}
      />

      {/* 🔥 Error */}
      {error && (
        <p className="text-red-500 text-xs mt-1">
          {String(error.message ?? "This field is required")}
        </p>
      )}
    </div>
  );
}