"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { subCategorySchema } from "@/lib/validators/subcategory.schema";
import { subCategoryTranslationSchema } from "@/lib/validators/subcategory.schema";
import { generateSlug } from "@/lib/utils/slug";

/* ---------------- RESPONSE TYPES ---------------- */

type ActionResponse<T = null> = {
  success: boolean;
  message: string;
  data?: T;
};

/* ---------------- CREATE ---------------- */

export async function createSubCategory(
  data: unknown
): Promise<ActionResponse> {
  try {
    const parsed = subCategorySchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid subcategory payload",
      };
    }

    const slug = generateSlug(parsed.data.title);

    const existing = await db.subCategory.findUnique({
      where: { slug },
    });

    if (existing) {
      return {
        success: false,
        message: "SubCategory slug already exists",
      };
    }

    await db.subCategory.create({
      data: {
        ...parsed.data,
        slug,
      },
    });

    revalidatePath("/dashboard/subcategories");

    return {
      success: true,
      message: "SubCategory created successfully",
    };
  } catch (error) {
    console.error("Create SubCategory Error:", error);
    return {
      success: false,
      message: "Failed to create subcategory",
    };
  }
}

/* ---------------- UPDATE ---------------- */

export async function updateSubCategory(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const parsed = subCategorySchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        message: parsed.error.issues[0]?.message ?? "Invalid subcategory payload",
      };
    }

    const slug = generateSlug(parsed.data.title);

    const existing = await db.subCategory.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (existing) {
      return {
        success: false,
        message: "SubCategory slug already exists",
      };
    }

    await db.subCategory.update({
      where: { id },
      data: {
        ...parsed.data,
        slug,
      },
    });

    revalidatePath("/dashboard/subcategories");

    return {
      success: true,
      message: "SubCategory updated successfully",
    };
  } catch (error) {
    console.error("Update SubCategory Error:", error);
    return {
      success: false,
      message: "Failed to update subcategory",
    };
  }
}

/* ---------------- DELETE ---------------- */

export async function deleteSubCategory(
  id: string
): Promise<ActionResponse> {
  try {
    await db.subCategory.delete({
      where: { id },
    });

    revalidatePath("/dashboard/subcategories");

    return {
      success: true,
      message: "SubCategory deleted successfully",
    };
  } catch (error) {
    console.error("Delete SubCategory Error:", error);
    return {
      success: false,
      message: "Failed to delete subcategory",
    };
  }
}

/* ---------------- BULK DELETE ---------------- */

export async function deleteMultipleSubCategories(
  ids: string[]
): Promise<ActionResponse> {
  try {
    await db.subCategory.deleteMany({
      where: { id: { in: ids } },
    });

    revalidatePath("/dashboard/subcategories");

    return {
      success: true,
      message: "SubCategories deleted successfully",
    };
  } catch (error) {
    console.error("Bulk Delete Error:", error);
    return {
      success: false,
      message: "Failed to delete multiple subcategories",
    };
  }
}

/* ---------------- GET ALL ---------------- */

export async function getSubCategories() {
  return await db.subCategory.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      hsnCode: true,
    },
  });
}

/* ---------------- GET BY ID ---------------- */

export async function getSubCategoryById(id: string) {
  return await db.subCategory.findUnique({
    where: { id },
    include: {
      category: true,
      hsnCode: true,
    },
  });
}

/* ---------------- GET BY CATEGORY ---------------- */

export async function getSubCategoriesByCategory(
  categoryId: string
) {
  return await db.subCategory.findMany({
    where: { categoryId },
    include: {
      hsnCode: true,
    },
  });
}

/* ================= TRANSLATIONS ================= */

/* ---------------- CREATE ---------------- */

export async function createSubCategoryTranslation(
  data: unknown
): Promise<ActionResponse> {
  try {
    const validated = subCategoryTranslationSchema.safeParse(data);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message ?? "Invalid translation payload",
      };
    }

    const result = await db.subCategoryTranslation.create({
      data: validated.data,
    });

    return {
      success: true,
      message: "SubCategory translation created successfully",
      data: result,
    };
  } catch (error) {
    console.error("Create Translation Error:", error);
    return {
      success: false,
      message: "Failed to create translation",
    };
  }
}

/* ---------------- UPDATE ---------------- */

export async function updateSubCategoryTranslation(
  id: string,
  data: unknown
): Promise<ActionResponse> {
  try {
    const validated = subCategoryTranslationSchema.safeParse(data);

    if (!validated.success) {
      return {
        success: false,
        message: validated.error.issues[0]?.message ?? "Invalid translation payload",
      };
    }

    const result = await db.subCategoryTranslation.update({
      where: { id },
      data: validated.data,
    });

    return {
      success: true,
      message: "SubCategory translation updated successfully",
      data: result,
    };
  } catch (error) {
    console.error("Update Translation Error:", error);
    return {
      success: false,
      message: "Failed to update translation",
    };
  }
}

/* ---------------- DELETE ---------------- */

export async function deleteSubCategoryTranslation(
  id: string
): Promise<ActionResponse> {
  try {
    await db.subCategoryTranslation.delete({
      where: { id },
    });

    return {
      success: true,
      message: "SubCategory translation deleted successfully",
    };
  } catch (error) {
    console.error("Delete Translation Error:", error);
    return {
      success: false,
      message: "Failed to delete translation",
    };
  }
}

/* ---------------- GET ---------------- */

export async function getTranslationsBySubCategory(
  subCategoryId: string
) {
  return await db.subCategoryTranslation.findMany({
    where: { subCategoryId },
  });
}
