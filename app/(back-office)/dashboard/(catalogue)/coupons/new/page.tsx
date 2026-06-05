import { auth } from "@/auth"
import FormHeader from "@/components/backoffice/FormHeader"
import CouponForm from "@/components/backoffice/Forms/CouponForm"

export default async function NewCoupon() {
  const session = await auth()

  if (!session?.user?.id) {
    return <div>Unauthorized</div>
  }

  return (
    <div>
      <FormHeader title="New Coupon" />
      <CouponForm vendorId={session.user.id} />
    </div>
  )
}
