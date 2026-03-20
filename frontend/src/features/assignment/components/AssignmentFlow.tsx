"use client";

import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { FlowErrorScreen } from "@/features/assignment/components/flow/FlowErrorScreen";
import { FlowCompletedScreen } from "@/features/assignment/components/flow/FlowCompletedScreen";
import { FlowProcessingScreen } from "@/features/assignment/components/flow/FlowProcessingScreen";
import { FileUploadSection } from "@/features/assignment/components/flow/FileUploadSection";
import { CreateAssignmentForm } from "@/features/assignment/components/flow/CreateAssignmentForm";
import { EmptyStateScreen } from "@/features/assignment/components/flow/EmptyStateScreen";

export function AssignmentFlow() {
  const step = useAssignmentFlowStore((s) => s.step);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-2xl bg-[#f5f5f5] p-2 md:p-3 [font-family:var(--font-bricolage)]">
      <div key={step} className="h-full min-h-0 animate-[fadeIn_220ms_ease-out]">
        {step === "idle" ? <EmptyStateScreen /> : null}
        {step === "creating" ? <CreateAssignmentForm /> : null}
        {step === "uploading" ? <FileUploadSection /> : null}
        {step === "processing" ? <FlowProcessingScreen /> : null}
        {step === "completed" ? <FlowCompletedScreen /> : null}
        {step === "error" ? <FlowErrorScreen /> : null}
      </div>
    </section>
  );
}

