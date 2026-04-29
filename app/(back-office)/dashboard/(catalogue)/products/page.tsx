import PageHeader from "@/components/backoffice/PageHeader";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import { getProducts } from "@/actions/product";

type Props = {
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
  };
};

export default async function ProductsPage({ searchParams }: Props) {
  /* ================= PARAMS ================= */
  const page = Number(searchParams?.page ?? "1");
  const limit = Number(searchParams?.limit ?? "10");
  const search = searchParams?.search ?? "";

  /* ================= FETCH ================= */
  const res = await getProducts({ page, limit, search });

  /* ================= ERROR ================= */
  if (!res.success || !res.data) {
    return (
      <div className="p-6 text-sm text-red-500">
        ❌ Failed to load products: {res.error}
      </div>
    );
  }

  const { data, total } = res.data;

  /* ================= EMPTY ================= */
  if (data.length === 0) {
    return (
      <div className="p-6 space-y-4">
        <PageHeader
          title="Products"
          href="/dashboard/products/new"
          linkTitle="Add Product"
        />

        <div className="text-sm text-muted-foreground border rounded-lg p-6 text-center">
          No products found 🚀 <br />
          Try changing search or add a new product.
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Products"
        href="/dashboard/products/new"
        linkTitle="Add Product"
      />

      <DataTable
        columns={columns}
        data={data}
      />

      <div className="flex justify-end text-xs text-muted-foreground">
        Page: {page} | Limit: {limit} | Total: {total}
      </div>
    </div>
  );
}
