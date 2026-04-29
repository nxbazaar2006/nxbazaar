import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get("search") || "";
  const page = Number(req.nextUrl.searchParams.get("page") || 1);
  const limit = 10;

  const results = await db.hsnCode.findMany({
    where: search
      ? {
          OR: [
            { code: { contains: search, mode: "insensitive" } },
            { title: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    take: limit,
    skip: (page - 1) * limit,
  });

  return NextResponse.json(results);
}