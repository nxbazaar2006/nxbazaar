import { db } from "@/lib/db";
import { Info } from "lucide-react";

interface VerifyMailPageProps {
  searchParams: {
    userId?: string;
  };
}

export default async function VerifyMailPage({
  searchParams,
}: VerifyMailPageProps) {
  const userId = searchParams.userId;

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      email: true,
    },
  });

  const email = user?.email;

  return (
    <div className="max-w-2xl mx-auto min-h-screen mt-8 px-4">
      <div
        role="alert"
        className="p-4 mb-4 text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
      >
        <div className="flex items-center">
          <Info className="w-4 h-4 me-2" />
          <h3 className="text-lg font-medium">
            Email Sent - Verify your account
          </h3>
        </div>

        <div className="mt-2 mb-4 text-sm">
          Thank you for creating an account with us. We have sent an email to{" "}
          <span className="font-bold">{email}</span>. Please check your inbox
          and click the verification link to complete your onboarding process.
        </div>

        <button className="text-blue-600 hover:underline text-sm">
          Change email
        </button>
      </div>
    </div>
  );
}
