"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useHsn } from "@/hooks/useHsn";
import { useDebounce } from "@/hooks/useDebounce";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Controller,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";

/* ================= TYPES ================= */

type HsnItem = {
  id: string;
  code: string;
  title: string;
  gstRate: number;
};

type Props<T extends FieldValues> = {
  name?: Path<T>;
  value?: HsnItem | null;
  onChange?: (value: HsnItem | null) => void;
  placeholder?: string;
};

/* ================= COMPONENT ================= */

export default function SearchSelectInput<T extends FieldValues>({
  name,
  value: controlledValue,
  onChange,
  placeholder = "Select HSN Code",
}: Props<T>) {
  const { control } = useFormContext<T>();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const debounced = useDebounce(search, 400);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
  } = useHsn(debounced);

  const flatData = (data?.pages?.flat() ?? []) as unknown as HsnItem[];

  const renderSelect = (
    value: HsnItem | null,
    handleChange: (value: HsnItem | null) => void
  ) => (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between 
                bg-white/40 backdrop-blur-md 
                text-black border-white/20"
        >
          {value
            ? `${value.code} - ${value.title} (${value.gstRate}%)`
            : placeholder}

          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[--radix-popover-trigger-width] p-0 
              bg-white/40 backdrop-blur-xl 
              border border-white/20 shadow-xl rounded-xl"
      >
        <Command className="bg-transparent text-black">
          <CommandInput
            placeholder="Search HSN code..."
            value={search}
            onValueChange={setSearch}
            className="text-black placeholder:text-gray-600"
          />

          <CommandEmpty className="text-black">
            {isLoading ? "Loading..." : "No HSN found"}
          </CommandEmpty>

          <CommandGroup className="max-h-64 overflow-y-auto">
            {flatData.map((item) => (
              <CommandItem
                key={item.id}
                value={item.code}
                onSelect={() => {
                  handleChange(item);
                  setOpen(false);
                }}
                className="text-black hover:bg-white/60 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-black">{item.code}</span>

                  <span className="text-xs text-gray-600">
                    {item.title} ({item.gstRate}%)
                  </span>
                </div>

                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value?.id === item.id
                      ? "opacity-100 text-orange-500"
                      : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}

            {hasNextPage && (
              <div className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  className="text-sm text-black hover:underline"
                >
                  Load more...
                </button>
              </div>
            )}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );

  if (!name) {
    return renderSelect(controlledValue ?? null, onChange ?? (() => undefined));
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={null as never}
      render={({ field }) => {
        const value = field.value as HsnItem | null;
        return renderSelect(value, field.onChange);
      }}
    />
  );
}
