"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";

type Props = {
  name: string;
  label: string;
  placeholder?: string;
};

export default function ArrayItemsInput({
  name,
  label,
  placeholder = "Add item",
}: Props) {
  const { control } = useFormContext();
  const [value, setValue] = useState("");

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={[]}
      render={({ field }) => {
        const items: string[] = field.value || [];

        function addItem() {
          if (!value.trim()) return;
          field.onChange([...items, value]);
          setValue("");
        }

        function removeItem(index: number) {
          field.onChange(items.filter((_, i) => i !== index));
        }

        return (
          <div>
            <label className="block mb-1 text-sm font-medium">
              {label}
            </label>

            <div className="flex gap-2">
              <input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="border rounded-2xl p-2 w-full"
              />

              <button
                type="button"
                onClick={addItem}
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm  transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {items.map((item, i) => (
                <span
                  key={i}
                  className="bg-gray-200 px-2 py-1 rounded-2xl flex items-center gap-2"
                >
                  {item}

                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        );
      }}
    />
  );
}
