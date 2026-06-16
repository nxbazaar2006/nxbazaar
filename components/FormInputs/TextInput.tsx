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
      <label className="text-sm font-medium text-foreground">
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
            w-full rounded-2xl border border-slate-200 bg-transparent px-3 py-2 text-foreground shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-orange-400 focus:ring-[3px] focus:ring-orange-500/20 dark:border-white/10 dark:focus:border-orange-400
            ${icon ? "pl-10" : ""}
            ${error ? "border-destructive focus:ring-red-500/20" : ""}
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
