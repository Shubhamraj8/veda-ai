"use client";

import { Button } from "@/components/ui/button";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { EmptyStateIllustration } from "@/features/assignment/components/flow/EmptyStateIllustration";

export function EmptyStateScreen() {
  const setStep = useAssignmentFlowStore((s) => s.setStep);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center bg-transparent px-6 text-center">
      <EmptyStateIllustration />

      <h2 className="mt-2 h-[28px] w-[181px] text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
        No assignments yet
      </h2>
      <p className="mt-2 h-[66px] w-[486px] text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
        Create your first assignment to start collecting and grading student submissions.
      </p>
      <Button
        className="mt-6 h-[44px] gap-2 rounded-full bg-[#15171b] px-8 text-base font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
        onClick={() => setStep("creating")}
      >
        <span className="flex h-[22px] w-[205px] items-center justify-center [font-family:var(--font-bricolage)] text-[16px] font-medium leading-[140%] tracking-[-0.04em]">
          + Create Your First Assignment
        </span>
      </Button>
    </div>
  );
}

