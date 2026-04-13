import { getMarkets } from "@/actions/market";
import PageHeader from "@/components/backoffice/PageHeader";
import DataTable from "@/components/data-table-components/DataTable";
import { columns } from "./columns";
import { Market } from "@/types/market";

export default async function Page() {
  
  const response = await getMarkets();

 
  
 

  return (
    <div className="space-y-6">
      
      <PageHeader
        heading="Markets"
        href="/dashboard/markets/new"
        linkTitle="Add Market"
      />

     
      <DataTable
        data={markets}
        columns={columns}
      />
    </div>
  );
}