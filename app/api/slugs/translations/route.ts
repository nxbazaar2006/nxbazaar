import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createTranslationWithSlug } from "@/lib/slug/translationSlug.service";
import { SUPPORTED_SLUG_ENTITIES } from "@/lib/slug/translationSlug.types";

const createTranslationSlugSchema = z.object({
  entity: z.enum(SUPPORTED_SLUG_ENTITIES),
  parentId: z.string().min(1),
  locale: z.string().min(2),
  title: z.string().min(2),
  description: z.string().optional(),
  slug: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const payload = createTranslationSlugSchema.parse(await request.json());
    const created = await createTranslationWithSlug(payload);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0]?.message ?? "Invalid payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error?.message ?? "Failed to create translation slug" },
      { status: 500 }
    );
  }
}
