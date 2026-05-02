"use client";

import {
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  trueTitle: string;
  falseTitle: string;
};

export default function ToggleInput<T extends FieldValues>({
  label,
  name,
  trueTitle,
  falseTitle,
}: Props<T>) {
  const { register } = useFormContext<T>();

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium">{label}</span>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {falseTitle}
        </span>

        <input
          type="checkbox"
          {...register(name)}
          className="w-4 h-4 accent-orange-500 cursor-pointer"
        />

        <span className="text-sm text-gray-500">
          {trueTitle}
        </span>
      </div>
    </div>
  );
}