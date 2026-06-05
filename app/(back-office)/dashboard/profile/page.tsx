import { auth } from "@/auth";
import { Mail, Shield, UserRound } from "lucide-react";

export default async function Page() {
  const session = await auth();

  if (!session) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-100">
        Please login
      </div>
    );
  }

  const { user } = session;
  const detailItems = [
    {
      label: "Name",
      value: user?.name ?? "Not set",
      icon: UserRound,
    },
    {
      label: "Email",
      value: user?.email ?? "Not set",
      icon: Mail,
    },
    {
      label: "Role",
      value: user?.role ?? "User",
      icon: Shield,
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="text-sm font-medium text-sky-700 dark:text-cyan-200">
          Account
        </p>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-white">
          Profile Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Review your account information and access level.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm shadow-slate-200/60 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-5 dark:border-white/10">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 via-sky-500 to-emerald-500 text-lg font-semibold text-white">
            {(user?.name ?? user?.email ?? "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              {user?.name ?? "User"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {user?.email ?? "No email available"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {detailItems.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-cyan-500/10 dark:text-cyan-200">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-950 dark:text-white">
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
