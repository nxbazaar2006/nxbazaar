"use server"

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { couponSchema } from "@/lib/validators/coupon.schema"
import { generateCouponCode } from "@/lib/generateCouponCode"
import { CouponResponse, CouponsResponse } from "@/types/coupon"

export async function createCoupon(data: unknown): Promise<CouponResponse> {
  try {
    const parsed = couponSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors.title?.[0] || "Validation failed" }
    }

    const couponCode = parsed.data.couponCode || generateCouponCode()
    const expiryDate = new Date(parsed.data.expiryDate)

    // Check if coupon code already exists
    const existing = await db.coupon.findFirst({
      where: { couponCode },
    })

    if (existing) {
      return { success: false, error: "Coupon code already exists" }
    }

    const coupon = await db.coupon.create({
      data: {
        ...parsed.data,
        couponCode,
        expiryDate,
      },
      include: { vendor: true },
    })

    revalidatePath("/dashboard/coupons")
    return { success: true, data: coupon }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create coupon" }
  }
}

export async function updateCoupon(id: string, data: unknown): Promise<CouponResponse> {
  try {
    const parsed = couponSchema.safeParse(data)

    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().fieldErrors.title?.[0] || "Validation failed" }
    }

    const couponCode = parsed.data.couponCode || generateCouponCode()
    const expiryDate = new Date(parsed.data.expiryDate)

    const coupon = await db.coupon.update({
      where: { id },
      data: {
        ...parsed.data,
        couponCode,
        expiryDate,
      },
      include: { vendor: true },
    })

    revalidatePath("/dashboard/coupons")
    return { success: true, data: coupon }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update coupon" }
  }
}

export async function deleteCoupon(id: string): Promise<CouponResponse> {
  try {
    await db.coupon.delete({
      where: { id },
    })

    revalidatePath("/dashboard/coupons")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon" }
  }
}

export async function deleteMultipleCoupons(ids: string[]): Promise<CouponResponse> {
  try {
    await db.coupon.deleteMany({
      where: { id: { in: ids } },
    })

    revalidatePath("/dashboard/coupons")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupons" }
  }
}

export async function getCoupons(): Promise<CouponsResponse> {
  try {
    const coupons = await db.coupon.findMany({
      include: { vendor: true },
      orderBy: { expiryDate: "desc" },
    })
    return { success: true, data: coupons }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch coupons" }
  }
}

export async function getCoupon(id: string): Promise<CouponResponse> {
  try {
    const coupon = await db.coupon.findUnique({
      where: { id },
      include: { vendor: true },
    })

    if (!coupon) {
      return { success: false, error: "Coupon not found" }
    }

    return { success: true, data: coupon }
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch coupon" }
  }
}
