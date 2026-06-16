import PageHeader from "@/components/backoffice/PageHeader";
import ProductImportButton from "@/components/backoffice/ProductImportButton";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import { getProducts } from "@/actions/product";

type Props = {
  searchParams?: {
    page?: string;
    limit?: string;
    search?: string;
    report?: string;
  };
};

export default async function ProductsPage({ searchParams }: Props) {
  /* ================= PARAMS ================= */
  const page = Number(searchParams?.page ?? "1");
  const limit = Number(searchParams?.limit ?? "10");
  const search = searchParams?.search ?? "";
  const isReportView = searchParams?.report === "1";

  /* ================= FETCH ================= */
  const res = await getProducts({ page, limit, search });

  /* ================= ERROR ================= */
  if (!res.success) {
    return (
      <div className="space-y-4 text-sm text-red-500">
        ❌ Failed to load products: {res.error}
      </div>
    );
  }

  const data = Array.isArray(res.data.data) ? res.data.data : [];
  const total = typeof res.data.total === "number" ? res.data.total : data.length;

  /* ================= EMPTY ================= */
  if (data.length === 0) {
    return (
      <div className="min-w-0 space-y-4">
        {isReportView ? (
          <PageHeader heading="Products" />
        ) : (
          <>
            <PageHeader
              heading="Products"
              href="/dashboard/products/new"
              linkTitle="Add Product"
            />
            <div className="flex justify-end">
              <ProductImportButton />
            </div>
          </>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center text-sm text-slate-600 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400 dark:shadow-black/20">
          No products found. <br />
          Try changing search.
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-w-0 space-y-4">
      {isReportView ? (
        <PageHeader heading="Products" />
      ) : (
        <>
          <PageHeader
            heading="Products"
            href="/dashboard/products/new"
            linkTitle="Add Product"
          />
          <div className="flex justify-end">
            <ProductImportButton />
          </div>
        </>
      )}

      <DataTable
        columns={columns}
        data={data}
        endpoint="products"
        queryKey={["products"]}
      />

      <div className="flex justify-end text-xs text-slate-600 dark:text-slate-400">
        Page: {page} | Limit: {limit} | Total: {total}
      </div>
    </div>
  );
}
