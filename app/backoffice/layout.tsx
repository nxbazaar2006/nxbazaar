import DashboardLayoutClient from "../(back-office)/layout";

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
