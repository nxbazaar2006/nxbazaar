import Heading from "@/components/backoffice/Heading";
import PageHeader from "@/components/backoffice/PageHeader";
import TableActions from "@/components/backoffice/TableActions";
import DataTable from "@/components/data-table-components/DataTable";
import { db } from "@/lib/db";

import Link from "next/link";
import React from "react";
import { columns } from "./columns";

export default async function Coupons() {
  const allSales = await db.sale.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch all the Sales
  // Filter by vendorId => to get sales for this vendor
  //Fetch Order by Id
  // Customer Name, email,Phone,OrderNumber
  const sellerSales = allSales;
  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Coupons"
        href="/dashboard/coupons/new"
        linkTitle="Add Coupon"
      />
      <div className="py-8">
        {role === "ADMIN" ? (
          <DataTable data={allSales} columns={columns} />
        ) : (
          <DataTable data={sellerSales} columns={columns} />
        )}
      </div>
    </div>
  );
}
