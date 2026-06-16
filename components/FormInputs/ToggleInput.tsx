"use client";

import {
  FieldErrors,
  FieldValues,
  RegisterOptions,
  Path,
  UseFormRegister,
  get,
  useFormContext,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
  trueTitle: string;
  falseTitle: string;
  register?: UseFormRegister<T>;
  errors?: FieldErrors<T>;
};

export default function ToggleInput<T extends FieldValues>({
  label,
  name,
  rules,
  trueTitle,
  falseTitle,
  register: registerProp,
  errors: errorsProp,
}: Props<T>) {
  const formContext = useFormContext<T>();
  const register = registerProp ?? formContext?.register;
  const errors = errorsProp ?? formContext?.formState.errors;

  if (!register) {
    throw new Error("ToggleInput requires react-hook-form register or FormProvider");
  }

  const error = errors ? get(errors, name) : undefined;

  return (
    <div className="space-y-1 rounded-2xl border border-slate-200 bg-transparent px-3 py-2 shadow-sm dark:border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {falseTitle}
          </span>

          <input
            type="checkbox"
            {...register(name, rules)}
            className="w-4 h-4 accent-orange-500 cursor-pointer"
          />

          <span className="text-sm text-gray-500">
            {trueTitle}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs">
          {String(error.message ?? "This field is required")}
        </p>
      )}
    </div>
  );
}
