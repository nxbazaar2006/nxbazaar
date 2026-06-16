"use client";

import { DoorOpen, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";

type SearchFormProps = {
  placeholderContent?: string;
};

type FormData = {
  searchTerm: string;
};

export default function SearchForm({
  placeholderContent = "Search Products, Categories, Markets...",
}: SearchFormProps) {
  const { register, handleSubmit, reset } = useForm<FormData>();
  const router = useRouter();

  const handleSearch = (data: FormData) => {
    const searchTerm = data.searchTerm.trim();

    if (!searchTerm) return;

    reset();

    // encode for safety (important 🔥)
    router.push(`/search?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <form
      onSubmit={handleSubmit(handleSearch)}
      className="flex items-center max-w-3xl mx-auto"
    >
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>

      <div className="relative w-full">
        {/* LEFT ICON */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <DoorOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </div>

        {/* INPUT */}
        <input
          {...register("searchTerm", { required: true })}
          type="text"
          id="search-input"
          placeholder={placeholderContent}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-2xl focus:ring-lime-500 focus:border-lime-500 block w-full pl-10 pr-3 py-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        />
      </div>

      {/* BUTTON */}
      <button
        type="submit"
        className="inline-flex items-center py-2.5 px-4 ml-2 text-sm font-medium text-white bg-lime-700 rounded-2xl border border-lime-700 hover:bg-lime-800 focus:ring-4 focus:outline-none focus:ring-lime-300"
      >
        <Search className="w-4 h-4 mr-2" />
        Search
      </button>
    </form>
  );
}