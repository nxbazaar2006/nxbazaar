import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import FormHeader from "@/components/backoffice/FormHeader";
import BlogForm from "@/components/backoffice/BlogForm";

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
  const blog = await db.blog.findUnique({
    where: { id: params.id },
    include: { translations: true },
  });

  if (!blog) return notFound();

  return (
    <>
      <FormHeader title="Update Blog" />

      <BlogForm
        blogId={blog.id}
        initialData={{
          slug: blog.slug,
          imageUrl: blog.imageUrl ?? "",
          isActive: blog.isActive,
          isFeatured: blog.isFeatured,
          content: blog.content,
          userId: blog.userId,
          categoryId: blog.categoryId ?? "",
          translations: blog.translations,
        }}
      />
    </>
  );
}