"use server";

import { db } from "@/lib/db";
import { vlogSchema, type VlogInput } from "@/lib/validators/vlog.schema";
import { generateUniqueSlug } from "@/lib/generateUniqueSlug";
import { Language } from "@prisma/client";
import { auth } from "@/auth";

/* ================= GET ================= */

export async function getVlogs() {
  return db.vlog.findMany({
    include: { translations: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getVlogById(id: string) {
  return db.vlog.findUnique({
    where: { id },
    include: {
      translations: true,
      product: true,
      blog: true,
      user: true,
    },
  });
}

/* ================= CREATE ================= */

export async function createVlog(data: VlogInput) {
  const parsed = vlogSchema.parse(data);
  const session = await auth();

  // 🔥 slug per translation
  const translationsWithSlug = await Promise.all(
    parsed.translations.map(async (t: (typeof parsed.translations)[number]) => ({
      title: t.title,
      locale: t.locale.toUpperCase() as Language,
      slug: await generateUniqueSlug(
        "vlog",
        t.locale,
        t.slug ?? t.title
      ),
    }))
  );

  return db.vlog.create({
    data: {
      title: parsed.title,
      productId: parsed.productId,
      userId: parsed.userId ?? session?.user?.id,
      blogId: parsed.blogId,

      translations: {
        create: translationsWithSlug,
      },
    },
    include: { translations: true },
  });
}

/* ================= UPDATE ================= */

export async function updateVlog(id: string, data: VlogInput) {
  const parsed = vlogSchema.parse(data);

  const translationsWithSlug = await Promise.all(
    parsed.translations.map(async (t: (typeof parsed.translations)[number]) => ({
      title: t.title,
      locale: t.locale.toUpperCase() as Language,
      slug: await generateUniqueSlug(
        "vlog",
        t.locale,
        t.slug ?? t.title
      ),
    }))
  );

  return db.vlog.update({
    where: { id },
    data: {
      title: parsed.title,
      productId: parsed.productId,
      userId: parsed.userId,
      blogId: parsed.blogId,

      translations: {
        deleteMany: {},
        create: translationsWithSlug,
      },
    },
    include: { translations: true },
  });
}

/* ================= DELETE ================= */

export async function deleteVlog(id: string) {
  return db.vlog.delete({ where: { id } });
}
