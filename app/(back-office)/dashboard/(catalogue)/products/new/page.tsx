
import NewProductForm from "@/components/backoffice/NewProductForm";
import { getCategories } from "@/actions/category";
import { getSubCategories } from "@/actions/subcategory";
import { auth } from "@/auth";
import { db } from "@/lib/db";

/* ================= TYPES ================= */

type SelectOption = {
  id: string;
  title: string;
};

type SubCategoryOption = {
  id: string;
  title: string;
  categoryId: string;
  hsnCode: {
    id: string;
    code: string;
    title: string;
    gstRate: number;
  } | null;
};

/* ================= PAGE ================= */

export default async function NewProduct() {
  let categoriesData: Awaited<ReturnType<typeof getCategories>> = [];
  let subCategoriesResponse: Awaited<ReturnType<typeof getSubCategories>> | null =
    null;
  const session = await auth();

  if (!session?.user?.id) {
    return <div className="p-6 text-sm text-red-500">Unauthorized</div>;
  }

  const formUser = await db.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    select: { id: true },
  });

  if (!formUser) {
    return (
      <div className="p-6 text-sm text-red-500">
        Logged-in user was not found in database. Please sign in again.
      </div>
    );
  }

  /* ================= FETCH DATA (PARALLEL + SAFE) ================= */
  try {
    [categoriesData, subCategoriesResponse] = await Promise.all([
      getCategories(),
      getSubCategories(),
    ]);
  } catch (error) {
    console.error("DATA_FETCH_ERROR:", error);

    return (
      <div className="p-6 text-red-500">
        Failed to load form data
      </div>
    );
  }

  /* ================= SAFE FALLBACK ================= */
  const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];

  if (!subCategoriesResponse?.success) {
    return (
      <div className="p-6 text-red-500">
        Failed to load subcategories:{" "}
        {subCategoriesResponse?.message ?? "Unknown error"}
      </div>
    );
  }

  const safeSubCategories = Array.isArray(subCategoriesResponse.data)
    ? subCategoriesResponse.data
    : [];

  /* ================= MAP DATA ================= */

  const categories: SelectOption[] = safeCategories.map((cat) => ({
    id: cat.id,
    title: cat.translations?.[0]?.title ?? cat.slug,
  }));

  const subCategories: SubCategoryOption[] = safeSubCategories.map((sub) => ({
    id: sub.id,
    title: sub.translations?.[0]?.title ?? sub.slug,
    categoryId: sub.categoryId,
    hsnCode: sub.hsnCode
      ? {
          id: sub.hsnCode.id,
          code: sub.hsnCode.code,
          title: sub.hsnCode.title,
          gstRate: sub.hsnCode.gstRate,
        }
      : null,
  }));

  /* ================= EMPTY STATE ================= */

  if (categories.length === 0) {
    return (
      <div className="p-6 text-sm text-gray-500">
        No categories found. Please create category first.
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
     

      <NewProductForm
        userId={formUser.id}
        categories={categories}
        subCategories={subCategories}
      />
    </div>
  );
}
