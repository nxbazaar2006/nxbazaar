import PageHeader from "@/components/backoffice/PageHeader";
import BlogsClient from "./BlogsClient";
import { db } from "@/lib/db";

export default async function Page() {
  const blogs = await db.blog.findMany({
    include: {
      translations: true,
    },
  });

  return (
    <div>
      <PageHeader
        heading="Blogs"
        href="/dashboard/blog/new"
        linkTitle="Add Blogs"
      />

      <BlogsClient initialData={blogs} />
    </div>
  );
}
