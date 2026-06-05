import LoginForm from "@/components/frontend/LoginForm";

export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center px-6 py-8">
      
      <div className="glass-card w-full max-w-md">
        
        <div className="p-6 space-y-6 sm:p-8">
          
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl text-center">
            Login to Account
          </h1>

          <LoginForm />

        </div>

      </div>

    </section>
  );
}
