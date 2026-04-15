<<<<<<< HEAD
import SubCategoryForm from "@/components/backoffice/Forms/SubCategoryForm";
import { getCategories } from "@/actions/category";
import { getHsnCodes } from "@/actions/hsnCode";

export default async function NewSubCategoryPage() {
  const [categories, hsnCodes] = await Promise.all([getCategories(), getHsnCodes()]);

  return (
    <SubCategoryForm
      categories={Array.isArray(categories) ? categories : []}
      hsnCodes={hsnCodes}
    />
  );
}
=======
import SubCategoryForm from "@/components/forms/SubCategoryForm";
import { createSubCategory } from "@/lib/actions/subcategory";
import { redirect } from "next/navigation";
import { SubCategoryInput } from "@/lib/validators/subcategory.schema";

export default function Page() {
  async function onSubmit(data: SubCategoryInput) {
    "use server";

    await createSubCategory(data);

    redirect("/dashboard/subcategories");
  }

  return <SubCategoryForm onSubmit={onSubmit} />;
}
>>>>>>> cfe7124 (update)
