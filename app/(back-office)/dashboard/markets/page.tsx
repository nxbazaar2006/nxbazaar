import { getMarkets } from "@/actions/market";
import PageHeader from "@/components/backoffice/PageHeader";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";

export default async function Page() {
  const response = await getMarkets();

  if (!response.success) {
    return (
      <div className="space-y-4 text-sm text-red-500">
        Failed to load markets: {response.error}
      </div>
    );
  }

  const markets = Array.isArray(response.data) ? response.data : [];

  return (
    <div className="min-w-0 space-y-4">
      <PageHeader
        heading="Markets"
        subHeading="Manage your marketplace markets"
        href="/dashboard/markets/new"
        linkTitle="Add Market"
      />

      {markets.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center text-sm text-slate-600 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-400 dark:shadow-black/20">
          No markets found. <br />
          Add a new market to display data here.
        </div>
      ) : null}

      {markets.length > 0 ? (
        <DataTable
          data={markets}
          columns={columns}
          endpoint="markets"
          queryKey={["markets"]}
        />
      ) : null}
    </div>
  );
}
