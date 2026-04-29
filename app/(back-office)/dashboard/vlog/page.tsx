import PageHeader from "@/components/backoffice/PageHeader";
import VlogsClient from "./VlogsClient";
import { db } from "@/lib/db";

export default async function Page() {
  const vlogs = await db.vlog.findMany({
    include: {
      translations: true,
    },
  });

  return (
    <div>
      <PageHeader
        heading="Vlog"
        href="/dashboard/vlog/new"
        linkTitle="Add Vlog"
      />

      <VlogsClient initialData={vlogs} />
    </div>
  );
}