import { MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AssignmentDashboardCardModel } from "@/features/assignment/types/assignment-dashboard.types";

interface AssignmentCardProps {
  assignment: AssignmentDashboardCardModel;
  showActionsMenu?: boolean;
}

export function AssignmentCard({ assignment, showActionsMenu = false }: AssignmentCardProps) {
  return (
    <Card className="relative flex h-[162px] w-[542px] flex-col gap-12 rounded-[24px] bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="h-[29px] w-[199px] [font-family:var(--font-bricolage)] text-2xl font-extrabold leading-[120%] tracking-[-0.04em] text-slate-900">
          {assignment.title}
        </h3>
        <button type="button" className="rounded-full p-1 text-slate-400 hover:bg-slate-50" aria-label="More actions">
          <MoreVertical size={18} />
        </button>
      </div>

      {showActionsMenu ? (
        <div className="absolute right-14 top-14 flex h-[84px] w-[140px] flex-col gap-1 rounded-2xl bg-white p-2 shadow-[0_32px_48px_0_rgba(0,0,0,0.05),0_16px_48px_0_rgba(0,0,0,0.2)]">
          <button
            type="button"
            className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2 [font-family:var(--font-bricolage)] text-sm font-medium leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]"
          >
            View Assignment
          </button>
          <button
            type="button"
            className="flex h-8 w-full items-center gap-2.5 rounded-lg bg-[#f3f3f3] px-2"
          >
            <span className="h-5 w-10 [font-family:var(--font-bricolage)] text-sm font-medium leading-[140%] tracking-[-0.04em] text-[rgba(197,53,53,1)]">
              Delete
            </span>
          </button>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3 text-[30px] leading-9">
        <p className="h-[19px] w-[183px] [font-family:var(--font-bricolage)] text-base font-extrabold leading-[120%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
          <span>Assigned on:</span>{" "}
          <span className="[font-family:var(--font-bricolage)] text-base font-normal leading-[120%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
            {assignment.assignedOn}
          </span>
        </p>
        <p className="h-[19px] w-[116px] [font-family:var(--font-bricolage)] text-base font-extrabold leading-[120%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
          <span>Due:</span>{" "}
          <span className="[font-family:var(--font-bricolage)] text-base font-normal leading-[120%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
            {assignment.dueDate}
          </span>
        </p>
      </div>
    </Card>
  );
}
