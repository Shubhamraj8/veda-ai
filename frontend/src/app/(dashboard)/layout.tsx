import type { PropsWithChildren } from "react";
import { DashboardShell } from "@/components/shared/dashboard-shell";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return <DashboardShell>{children}</DashboardShell>;
}
