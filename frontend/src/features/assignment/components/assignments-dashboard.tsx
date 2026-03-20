"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AssignmentDashboardHeader } from "@/features/assignment/components/assignment-dashboard-header";
import { AssignmentGrid } from "@/features/assignment/components/assignment-grid";
import { EmptyAssignmentState } from "@/features/assignment/components/empty-assignment-state";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import type { AssignmentDashboardCardModel } from "@/features/assignment/types/assignment-dashboard.types";

interface AssignmentsDashboardProps {
  assignments: AssignmentDashboardCardModel[];
}

export function AssignmentsDashboard({ assignments }: AssignmentsDashboardProps) {
  const hasAssignments = assignments.length > 0;
  const router = useRouter();
  const setStep = useAssignmentFlowStore((s) => s.setStep);

  return (
    <section className="flex h-full flex-col rounded-3xl bg-[#f0f0f0] px-2 pb-2 pt-2 [font-family:var(--font-bricolage)]">
      <div className="relative flex h-full min-h-0 flex-col rounded-3xl bg-[#f5f5f5] p-2 md:p-3">
        {hasAssignments ? (
          <>
            <AssignmentDashboardHeader />
            <div className="min-h-0 flex-1 overflow-y-auto pb-28">
              <AssignmentGrid assignments={assignments} />
            </div>

            <div className="pointer-events-none absolute bottom-0 left-1/2 hidden h-[73px] w-[1125px] -translate-x-1/2 flex-col gap-2.5 rounded-[48px] bg-gradient-to-b from-[rgba(234,234,234,0)] to-[rgba(218,218,218,1)] py-[10px] backdrop-blur-[40px] md:flex" />
            <div className="pointer-events-none absolute bottom-3 left-1/2 hidden -translate-x-1/2 justify-center md:flex">
              <Button
                className="pointer-events-auto h-11 gap-2 rounded-full bg-[#15171b] px-8 text-base font-medium text-white shadow-[0_10px_22px_rgba(0,0,0,0.22)]"
                onClick={() => {
                  setStep("creating");
                  router.push("/assignments");
                }}
              >
                <Plus size={16} />
                Create Assignment
              </Button>
            </div>

            {/* Mobile floating action button (matches the screenshot style) */}
            <Button
              className="fixed right-6 bottom-24 z-[40] h-12 w-12 rounded-full bg-[#15171b] p-0 text-white shadow-[0_12px_24px_rgba(0,0,0,0.22)] md:hidden"
              onClick={() => {
                setStep("creating");
                router.push("/assignments");
              }}
              aria-label="Create assignment"
            >
              <Plus size={18} />
            </Button>
          </>
        ) : (
          <EmptyAssignmentState />
        )}
      </div>
    </section>
  );
}
