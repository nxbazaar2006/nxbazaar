import Link from "next/link";
import { auth } from "@/auth";
import ProfileSettingsForm from "@/components/backoffice/ProfileSettingsForm";
import { db } from "@/lib/db";
import { UserRound } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-white/40 p-6 text-center backdrop-blur-xl dark:border-white/10">
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
          Login required
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Please login to update your profile.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-full bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 px-5 py-2.5 text-sm font-semibold text-white"
        >
          Login
        </Link>
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: {
        select: {
          firstName: true,
          lastName: true,
          username: true,
          phone: true,
          streetAddress: true,
          city: true,
          district: true,
          state: true,
          country: true,
          zip: true,
          dateOfBirth: true,
          profileImage: true,
        },
      },
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
        User not found
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-sky-700 dark:text-cyan-200">
          <UserRound className="h-4 w-4" />
          My Account
        </p>
        <h1 className="mt-2 bg-gradient-to-r from-orange-500 via-fuchsia-500 to-sky-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
          User Profile
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Update your personal details, contact number, and address.
        </p>
      </div>

      <ProfileSettingsForm user={user} />
    </div>
  );
}
