import type { PropsWithChildren } from "react";
import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { Toaster } from "@/components/shared/toaster";
import { BottomNav } from "@/components/shared/bottom-nav";

export function DashboardShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-[var(--va-content-bg)]">
      {/* Desktop/tablet */}
      <div className="hidden items-center justify-center p-4 md:flex">
        <div className="grid h-[780px] w-[1440px] grid-cols-[304px_1fr] gap-3 overflow-hidden rounded-2xl p-3">
          <Sidebar />
          <section className="relative flex min-w-0 flex-col gap-3 overflow-hidden">
            <Topbar />
            <main className="min-h-0 flex-1 rounded-2xl bg-[var(--va-content-bg)]">{children}</main>
          </section>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex min-h-screen flex-col md:hidden">
        <Topbar />
        <main className="min-h-0 flex-1 bg-[var(--va-content-bg)] pb-28">{children}</main>
        <BottomNav />
      </div>

      <Toaster />
    </div>
  );
}
