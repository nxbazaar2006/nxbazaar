import { getMarkets } from "@/actions/market";
import PageHeader from "@/components/backoffice/PageHeader";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";

export default async function Page() {
  const response = await getMarkets();
  const markets = response.success ? response.data : [];

  return (
    <div className="space-y-6">
      
      <PageHeader
        heading="Markets"
        href="/dashboard/markets/new"
        linkTitle="Add Market"
      />

      {!response.success ? (
        <div className="rounded-md border border-red-300 p-4 text-sm text-red-500">
          {response.error}
        </div>
      ) : null}

      <DataTable
        data={markets}
        columns={columns}
      />
    </div>
  );
}
