import useSWR from "swr";

export function useSubCategories() {
  const { data, isLoading } = useSWR("/api/subcategories");

  return {
    data,
    isLoading,
  };
}