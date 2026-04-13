import PageHeader from "@/components/backoffice/PageHeader";
import DataTable from "@/components/data-table-components/DataTable";
import { getProducts } from "@/actions/products";
import { columns } from "./columns";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  /* ================= AUTH CHECK ================= */
  if (!session?.user?.id) {
    return (
      <div className="p-6 text-sm text-red-500">
        Unauthorized access
      </div>
    );
  }

  const { id: userId, role } = session.user;

  /* ================= ROLE BASED FILTER =================
     ADMIN  -> all products
     VENDOR -> only own products
  ====================================================== */
  const products = await getProducts({
    userId: role === "ADMIN" ? undefined : userId,
    includeRelations: true,
  });

  return (
    <div className="space-y-6">
      {/* ================= PAGE HEADER ================= */}
      <PageHeader
        heading="Products"
        href="/dashboard/products/new"
        linkTitle="Add Product"
      />

      {/* ================= TABLE ================= */}
      <div className="py-2">
        <DataTable
          data={products}
          columns={columns}
        />
      </div>
    </div>
  );
}