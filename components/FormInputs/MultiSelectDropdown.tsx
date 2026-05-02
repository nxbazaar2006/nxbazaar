"use client";

import * as React from "react";
import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

type Option = {
  label: string;
  value: string;
};

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  options: Option[];
};

export default function MultiSelectDropdown<T extends FieldValues>({
  label,
  name,
  options,
}: Props<T>) {
  const [open, setOpen] = React.useState(false);

  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  return (
    <div className="w-full">
      <label className="block mb-2 text-sm font-medium">{label}</label>

      <Controller
        name={name}
        control={control}
        defaultValue={[]}
        render={({ field }) => {
          const values: string[] = Array.isArray(field.value)
            ? field.value
            : [];

          const toggle = (val: string) => {
            const newValues = values.includes(val)
              ? values.filter((v) => v !== val)
              : [...values, val];

            field.onChange(newValues);
          };

          const remove = (val: string) => {
            field.onChange(values.filter((v) => v !== val));
          };

          const selectAll = () => {
            field.onChange(options.map((o) => o.value));
          };

          const clearAll = () => {
            field.onChange([]);
          };

          return (
            <>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {values.length > 0
                      ? `${values.length} selected`
                      : "Select options"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No results found.</CommandEmpty>

                    <div className="flex justify-between p-2 border-b">
                      <button
                        type="button"
                        onClick={selectAll}
                        className="text-xs text-blue-600"
                      >
                        Select All
                      </button>

                      <button
                        type="button"
                        onClick={clearAll}
                        className="text-xs text-red-600"
                      >
                        Clear
                      </button>
                    </div>

                    <CommandGroup className="max-h-60 overflow-y-auto">
                      {options.map((option) => {
                        const isSelected = values.includes(option.value);

                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => toggle(option.value)}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                isSelected ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            {option.label}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>

              {/* Selected */}
              {values.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {values.map((val) => {
                    const label =
                      options.find((o) => o.value === val)?.label;

                    return (
                      <Badge
                        key={val}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {label}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => remove(val)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              )}
            </>
          );
        }}
      />

      {/* Error */}
      {errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {String(errors[name]?.message)}
        </p>
      )}
    </div>
  );
}