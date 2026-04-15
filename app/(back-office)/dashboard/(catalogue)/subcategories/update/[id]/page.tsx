<<<<<<< HEAD
import { notFound } from "next/navigation";

import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { getCategories } from "@/actions/category";
import { getSubCategoryById } from "@/actions/subcategory";
import { getHsnCodes } from "@/actions/hsnCode";
=======
import { db } from "@/lib/db";
import SubCategoryForm from "@/components/forms/SubCategoryForm";
import { updateSubCategory } from "@/lib/actions/subcategory";
import { redirect } from "next/navigation";
import { SubCategoryInput } from "@/lib/validators/subcategory.schema";
>>>>>>> cfe7124 (update)

type PageProps = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: PageProps) {
  const subCategory = await db.subCategory.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });

  // 🔥 transform DB → form type (IMPORTANT)
  const initialData: SubCategoryInput | undefined = subCategory
    ? {
        slug: subCategory.slug,
        imageUrl: subCategory.imageUrl ?? undefined,
        isActive: subCategory.isActive,
        categoryId: subCategory.categoryId,
        hsnCodeId: subCategory.hsnCodeId ?? undefined,
        translations: subCategory.translations.map((t) => ({
          locale: t.locale,
          title: t.title,
          description: t.description ?? undefined,
        })),
      }
    : undefined;

  async function onSubmit(data: SubCategoryInput) {
    "use server";
    await updateSubCategory(params.id, data);
    redirect("/dashboard/subcategories");
  }

  if (!subCategory) {
    return notFound();
  }

  return (
    <SubCategoryForm
<<<<<<< HEAD
      categories={Array.isArray(categories) ? categories : []}
      hsnCodes={hsnCodes}
      updateData={subCategory}
=======
      initialData={initialData}
      onSubmit={onSubmit}
>>>>>>> cfe7124 (update)
    />
  );
}