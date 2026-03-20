import type { AssignmentDashboardCardModel } from "@/features/assignment/types/assignment-dashboard.types";
import { AssignmentCard } from "@/features/assignment/components/assignment-card";

interface AssignmentGridProps {
  assignments: AssignmentDashboardCardModel[];
}

export function AssignmentGrid({ assignments }: AssignmentGridProps) {
  return (
    <section className="grid w-full grid-cols-2 auto-rows-[162px] gap-5" aria-label="Assignments list">
      {assignments.map((assignment, index) => (
        <AssignmentCard key={assignment.id} assignment={assignment} showActionsMenu={index === 0} />
      ))}
    </section>
  );
}
