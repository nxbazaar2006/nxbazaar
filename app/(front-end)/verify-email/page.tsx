import { getUser } from "@/lib/getUser";
import { Info } from "lucide-react";

type Props = {
  searchParams: Promise<{
    userId?: string;
  }>;
};

export default async function VerifyMail({ searchParams }: Props) {
  const { userId } = await searchParams;

  if (!userId) {
    return <div>Invalid verification link</div>;
  }

  const user = await getUser(userId);

  if (!user) {
    return <div>User not found</div>;
  }

  const { email } = user;

  return (
    <div className="max-w-2xl mx-auto min-h-screen mt-8">
      <div
        className="p-4 mb-4 text-red-800 border border-red-300 rounded-2xl bg-red-50"
        role="alert"
      >
        <div className="flex items-center">
          <Info className="w-4 h-4 me-2" />
          <h3 className="text-lg font-medium">
            Email Sent - Verify your account
          </h3>
        </div>

        <div className="mt-2 mb-4 text-sm">
          Thank you for creating an account with us.
          We have sent an email to{" "}
          <span className="font-bold">{email}</span>.
          Please check your inbox and click the verification link
          to complete your onboarding process.
        </div>
      </div>
    </div>
  );
}