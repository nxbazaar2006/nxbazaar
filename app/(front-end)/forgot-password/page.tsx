import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 py-8">
      <div className="border bg-card text-card-foreground shadow-sm w-full max-w-md">
        <div className="p-6 space-y-6 sm:p-8">
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl text-center">
            Reset Password
          </h1>

          <ForgotPasswordForm />
        </div>
      </div>
    </section>
  );
}
