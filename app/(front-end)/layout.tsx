import Footer from "@/components/frontend/Footer";
import Navbar from "@/components/frontend/Navbar";
import DeliverWrapper from "@/components/location/DeliverWrapper";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DeliverWrapper>
      <div className="relative flex min-h-screen flex-col overflow-hidden text-foreground">
        <Navbar />

        <main className="relative z-10 flex-1 pt-24 sm:pt-28">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </DeliverWrapper>
  );
}
