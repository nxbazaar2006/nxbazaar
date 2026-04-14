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
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
};

export default function TextInput<T extends FieldValues>({
  label,
  name,
  register,
  errors,
  rules,
  type = "text",
  placeholder,
  disabled = false,
  required = false,
  icon,
}: Props<T>) {
  const error = get(errors, name);

  return (
    <div className="space-y-2">
      {/* 🍎 Label */}
      <label className="text-sm font-medium text-gray-900 dark:text-white/90">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* 🍎 Input Wrapper */}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        <input
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          {...register(name, rules)}
          className={`
            w-full px-4 py-3
            ${icon ? "pl-10" : ""}
            rounded-2xl

            bg-transparent dark:bg-black

            border
            ${
              error
                ? "border-red-500 focus:ring-red-500/20"
                : "border-white/80 hover:border-white"
            }

            text-gray-900 dark:text-white
            placeholder:text-gray-400

            outline-none
            transition-all duration-300 ease-in-out

            shadow-sm hover:shadow-md

            focus:ring-2 focus:ring-white/20
            focus:border-white

            ${disabled ? "opacity-60 cursor-not-allowed" : ""}
          `}
        />
      </div>

      {/* 🍎 Error */}
      {error && (
        <p className="text-red-500 text-xs mt-1 animate-pulse">
          {String(error.message ?? "This field is required")}
        </p>
      )}
    </div>
  );
}