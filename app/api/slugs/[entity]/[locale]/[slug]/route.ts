import { NextRequest, NextResponse } from "next/server";
import { findEntityByTranslationSlug } from "@/lib/slug/translationSlug.service";
import { SUPPORTED_SLUG_ENTITIES, SlugEntity } from "@/lib/slug/translationSlug.types";

type RouteParams = {
  params: Promise<{
    entity: string;
    locale: string;
    slug: string;
  }>;
};

function isEntitySupported(entity: string): entity is SlugEntity {
  return (SUPPORTED_SLUG_ENTITIES as readonly string[]).includes(entity);
}

export async function GET(_request: NextRequest, context: RouteParams) {
  try {
    const { entity, locale, slug } = await context.params;

    if (!isEntitySupported(entity)) {
      return NextResponse.json({ success: false, message: "Unsupported entity" }, { status: 400 });
    }

    const data = await findEntityByTranslationSlug(entity, locale, slug);

    if (!data) {
      return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to fetch record by translation slug" },
      { status: 500 }
    );
  }
}
