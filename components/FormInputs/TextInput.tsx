"use client";

import {
  FieldErrors,
  FieldValues,
  Path,
  RegisterOptions,
  UseFormRegister,
  useFormContext,
  get,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
  className?: string;
  register?: UseFormRegister<T>;
  errors?: FieldErrors<T>;
};

export default function TextInput<T extends FieldValues>({
  label,
  name,
  rules,
  type = "text",
  placeholder,
  disabled = false,
  readOnly = false,
  required = false,
  icon,
  className = "",
  register: registerProp,
  errors: errorsProp,
}: Props<T>) {
  const formContext = useFormContext<T>();
  const register = registerProp ?? formContext?.register;
  const errors = errorsProp ?? formContext?.formState.errors;

  if (!register) {
    throw new Error("TextInput requires react-hook-form register or FormProvider");
  }

  const error = errors ? get(errors, name) : undefined;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-900 dark:text-white/90">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

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
          readOnly={readOnly}
          {...register(name, rules)}
          className={`
            w-full px-4 py-3
            ${icon ? "pl-10" : ""}
            rounded-2xl

            

            border
            ${
              error
                ? "border-white focus:ring-red-500/20"
                : "border-white/80 hover:border-white"
            }

            text-gray-900 dark:text-white
            placeholder

            outline-none
            transition-all duration-300 ease-in-out

            shadow-sm hover:shadow-md

            focus:ring-2 focus:ring-white/20
            focus:border-white

            ${(disabled || readOnly) ? "opacity-70 cursor-default" : ""}
          `}
        />
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1 animate-pulse">
          {String(error.message ?? "This field is required")}
        </p>
      )}
    </div>
  );
}
