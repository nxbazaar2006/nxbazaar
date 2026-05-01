import { getCategoryById } from "@/actions/category";
import NewCategoryForm from "@/components/backoffice/forms/NewCategoryForm";
import { Language } from "@prisma/client";

interface UpdatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UpdatePage({
  params,
}: UpdatePageProps) {
  // ✅ FIX HERE
  const { id } = await params;

  if (!id) {
    return (
      <div className="p-6 text-red-500 font-medium">
        Invalid Category ID
      </div>
    );
  }

  try {
    const res = await getCategoryById(id);

    if (!res?.data) {
      return (
        <div className="p-6 text-red-500 font-medium">
          Category not found
        </div>
      );
    }

    const category = res.data;

    const translation =
      category.translations?.find(
        (t) => t.locale === Language.EN
      ) ?? category.translations?.[0];

    const initialData = {
      id: category.id,
      title: translation?.title ?? "",
      description: translation?.description ?? "",
      imageUrl: category.imageUrl ?? "",
      isActive: category.isActive ?? true,
      locale: translation?.locale ?? Language.EN,
    };

    return <NewCategoryForm initialData={initialData} />;
  } catch (error) {
    console.error("CATEGORY_FETCH_ERROR:", error);

    return (
      <div className="p-6 text-red-500 font-medium">
        Something went wrong while loading category
      </div>
    );
  }
}