// app/(back-office)/layout.tsx

import DashboardLayoutClient from "./LayoutClient";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}