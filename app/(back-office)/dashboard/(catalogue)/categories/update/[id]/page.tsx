import { getCategoryById } from "@/actions/category";
import NewCategoryForm from "@/components/backoffice/forms/NewCategoryForm";

export default async function UpdatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) {
    throw new Error("ID not found");
  }

  const res = await getCategoryById(id);
  const category = res.data; // ✅ FIX

  const translation =
    category.translations?.find((t) => t.locale === "en") ||
    category.translations?.[0];

  const initialData = {
    id: category.id,
    title: translation?.title ?? "",
    description: translation?.description ?? "",
    imageUrl: category.imageUrl ?? "",
    isActive: category.isActive,
    locale: translation?.locale ?? "en", // ✅ FIX
  };

  return <NewCategoryForm initialData={initialData} />;
}