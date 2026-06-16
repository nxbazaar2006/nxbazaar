import { auth } from "@/auth";
import SellerProfileSettingsForm from "@/components/backoffice/SellerProfileSettingsForm";
import { db } from "@/lib/db";
import { Store } from "lucide-react";

export default async function SellerProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
        Please login
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: { sellerProfile: true },
  });

  if (!user) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
        User not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-foreground dark:text-cyan-200">
          <Store className="h-4 w-4" />
          Seller Account
        </p>
        <h1 className="text-foreground mt-2 text-2xl font-semibold">
          Seller Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Update business, GST, pickup, and payout details for your seller account.
        </p>
      </div>

      <SellerProfileSettingsForm user={user} />
    </div>
  );
}
