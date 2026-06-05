"use client"

import PageHeader from "@/components/backoffice/PageHeader"
import DataTable from "@/components/data-table-components/DataTable"
import { useCoupons } from "@/hooks/useCouponMutation"
import type { Coupon } from "@/types/coupon"
import { columns } from "./columns"

export default function CouponsPage() {
  const { data: response, isLoading } = useCoupons()
  const coupons: Coupon[] = response?.data ?? []

  return (
    <div className="space-y-4">
      <PageHeader
        heading="Coupons"
        href="/dashboard/coupons/new"
        linkTitle="Add Coupon"
      />

      <DataTable<Coupon>
        data={coupons}
        columns={columns}
        endpoint="coupons"
        queryKey={["coupons"]}
        isLoading={isLoading}
      />
    </div>
  )
}
