"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type SearchFormProps = {
  placeholderContent?: string;
};

type SearchFormData = {
  searchTerm: string;
};

export default function SearchForm({
  placeholderContent = "Search Products, Categories, Markets...",
}: SearchFormProps) {
  const { register, handleSubmit, reset } = useForm<SearchFormData>();
  const router = useRouter();

  function handleSearch(data: SearchFormData) {
    const { searchTerm } = data;

    if (!searchTerm) return;

    router.push(`/search?search=${encodeURIComponent(searchTerm)}`);

    reset();
  }

  return (
    <form
      onSubmit={handleSubmit(handleSearch)}
      className="apple-glass-control flex w-full items-center gap-2 p-2"
    >
      <label htmlFor="search" className="sr-only">
        Search
      </label>

      <div className="relative w-full">

        {/* icon */}

        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <Search className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* input */}

        <input
          {...register("searchTerm", { required: true })}
          type="text"
          id="search"
          placeholder={placeholderContent}
          className="block w-full rounded-full border-0 bg-transparent p-2.5 ps-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-0"
        />
      </div>

      {/* button */}

      <button
        type="submit"
        className="inline-flex items-center rounded-full bg-white px-4 py-2.5 text-sm font-medium text-slate-950 shadow-sm transition-colors hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-white/20"
      >
        <Search className="w-4 h-4 me-2" />
        Search
      </button>
    </form>
  );
}
