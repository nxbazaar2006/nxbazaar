"use server";

import { db } from "@/lib/db";
import {
  successResponse,
  errorResponse,
  ApiResponse,
} from "@/lib/response";
import { handleError } from "@/lib/error-handler";

/* ================= TYPES ================= */

export interface HsnOption {
  id: string;
  code: string;
  title: string;
  gstRate: number;
  label: string;
  value: string;
}

/* ================= GET ================= */

export async function getHsnCodes(): Promise<
  ApiResponse<HsnOption[]>
> {
  try {
    const hsnCodes = await db.hsnCode.findMany({
      select: {
        id: true,
        code: true,
        title: true,
        gstRate: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted: HsnOption[] = hsnCodes.map((item) => ({
      id: item.id,
      code: item.code,
      title: item.title,
      gstRate: item.gstRate,
      label: `${item.code} - ${item.title} (${item.gstRate}%)`,
      value: item.id,
    }));

    return successResponse(formatted);
  } catch (error: unknown) {
    const err = handleError(error);
    return errorResponse(err.message);
  }
}