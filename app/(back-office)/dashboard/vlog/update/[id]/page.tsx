import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import FormHeader from "@/components/backoffice/FormHeader";
import VlogForm from "@/components/backoffice/VlogForm";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const vlog = await db.vlog.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });

  if (!vlog) return notFound();

  return (
    <>
      <FormHeader title="Update Vlog" />

      <VlogForm
        vlogId={vlog.id}
        initialData={{
          title: vlog.title,
          productId: vlog.productId ?? "",
          userId: vlog.userId ?? "",
          blogId: vlog.blogId ?? "",
          translations: vlog.translations.map((t)=>({locale:t.locale.toLowerCase() as any,title:t.title,slug:t.slug})),
        }}
      />
    </>
  );
}