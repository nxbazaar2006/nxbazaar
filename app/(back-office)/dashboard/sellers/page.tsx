import PageHeader from "@/components/backoffice/PageHeader";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import { getSellers } from "@/actions/Seller";

/* ---------------- TYPES ---------------- */

type Seller = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  plan: string | null;
  status: boolean;
  createdAt: Date;
  sellerProfile?: {
    contactPerson: string | null;
    phone: string | null;
    mainProduct: string | null;
  } | null;
};

/* ---------------- PAGE ---------------- */

export default async function Page() {
  const response = await getSellers();

  // ✅ Better error handling
  if (!response.success) {
    console.error("GET SELLERS ERROR:", response.error);

    return (
      <div className="p-4 text-red-500">
        Failed to load sellers: {response.error}
      </div>
    );
  }

  const sellers: Seller[] = response.data ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        heading="Sellers"
        href="/dashboard/sellers/new"
        linkTitle="Add Seller"
      />

      <DataTable
        data={sellers}
        columns={columns}
      />
    </div>
  );
}
