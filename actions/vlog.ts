"use server";

import { db } from "@/lib/db";
import { vlogSchema, type VlogInput } from "@/lib/validators/vlog.schema";

export async function getVlogs() {
  return db.vlog.findMany({ include: { translations: true }, orderBy: { createdAt: "desc" } });
}

export async function getVlogById(id: string) {
  return db.vlog.findUnique({ where: { id }, include: { translations: true, product: true, blog: true, user: true } });
}

export async function createVlog(data: VlogInput) {
  const parsed = vlogSchema.parse(data);
  return db.vlog.create({
    data: {
      title: parsed.title,
      productId: parsed.productId,
      userId: parsed.userId,
      blogId: parsed.blogId,
      translations: {
        create: parsed.translations.map((t) => ({ ...t, locale: t.locale.toUpperCase() as any })),
      },
    },
    include: { translations: true },
  });
}

export async function updateVlog(id: string, data: VlogInput) {
  const parsed = vlogSchema.parse(data);
  return db.vlog.update({
    where: { id },
    data: {
      title: parsed.title,
      productId: parsed.productId,
      userId: parsed.userId,
      blogId: parsed.blogId,
      translations: { deleteMany: {}, create: parsed.translations.map((t) => ({ ...t, locale: t.locale.toUpperCase() as any })) },
    },
    include: { translations: true },
  });
}

export async function deleteVlog(id: string) {
  return db.vlog.delete({ where: { id } });
}
