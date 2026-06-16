import CartBanner from "@/components/Checkout/CartBanner";
import StepForm from "@/components/Checkout/StepForm";
import Steps from "@/components/Checkout/Steps";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

type Step = {
  number: number;
  title: string;
};

export default async function CheckoutPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const steps: Step[] = [
    { number: 1, title: "Personal Details" },
    { number: 2, title: "Shipping Details" },
    { number: 3, title: "Payment Method" },
    { number: 4, title: "Order Summary" },
  ];

  return (
    <div className="bg-background text-foreground min-h-screen py-6">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border bg-card text-card-foreground shadow-sm mx-auto max-w-3xl rounded-2xl p-6">
        
        {/* Steps */}
        <Steps steps={steps} />

        <div className="border bg-card text-card-foreground shadow-sm w-full rounded-2xl p-4 sm:p-6 md:p-8">
          
          {/* Banner */}
          <CartBanner />

          {/* Multi Step Form */}
          <StepForm />

        </div>
        </div>
      </div>
    </div>
  );
}
