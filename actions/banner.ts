"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { bannerSchema } from "@/lib/validators/banner.schema"
import { BannerResponse, BannersResponse } from "@/types/banner"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return "Something went wrong"
}

export async function createBanner(data: unknown): Promise<BannerResponse> {
  try {
    const parsed = bannerSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.title?.[0] ??
          "Validation failed",
      }
    }

    const banner = await db.banner.create({
      data: {
        ...parsed.data,
        link: parsed.data.link ?? "",
      },
    })

    revalidatePath("/dashboard/banners")

    return { success: true, data: banner }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function updateBanner(
  id: string,
  data: unknown
): Promise<BannerResponse> {
  try {
    const parsed = bannerSchema.safeParse(data)

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.flatten().fieldErrors.title?.[0] ??
          "Validation failed",
      }
    }

    const banner = await db.banner.update({
      where: { id },
      data: {
        ...parsed.data,
        link: parsed.data.link ?? "",
      },
    })

    revalidatePath("/dashboard/banners")

    return { success: true, data: banner }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteBanner(id: string): Promise<BannerResponse> {
  try {
    await db.banner.delete({
      where: { id },
    })

    revalidatePath("/dashboard/banners")

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function deleteMultipleBanners(
  ids: string[]
): Promise<BannerResponse> {
  try {
    await db.banner.deleteMany({
      where: { id: { in: ids } },
    })

    revalidatePath("/dashboard/banners")

    return { success: true }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getBanners(
  activeOnly?: boolean
): Promise<BannersResponse> {
  try {
    const banners = await db.banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: banners }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}

export async function getBanner(id: string): Promise<BannerResponse> {
  try {
    const banner = await db.banner.findUnique({
      where: { id },
    })

    if (!banner) {
      return { success: false, error: "Banner not found" }
    }

    return { success: true, data: banner }
  } catch (error: unknown) {
    return { success: false, error: getErrorMessage(error) }
  }
}
