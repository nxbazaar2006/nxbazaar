import { auth } from "@/auth"
import FormHeader from "@/components/backoffice/FormHeader"
import CouponForm from "@/components/backoffice/Forms/CouponForm"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

export default async function UpdateCoupon({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  const { id } = await params
  const coupon = await db.coupon.findUnique({
    where: { id },
  })

  if (!coupon) {
    notFound()
  }

  return (
    <div>
      <FormHeader title="Update Coupon" />
      <CouponForm
        updateData={{
          ...coupon,
          expiryDate: coupon.expiryDate.toISOString(),
        }}
        vendorId={session.user.id}
      />
    </div>
  )
}
