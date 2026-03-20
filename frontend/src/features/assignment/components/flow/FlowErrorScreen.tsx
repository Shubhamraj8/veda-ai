"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useAssignmentDataStore } from "@/features/assignment/store/assignment-data.store";
import { useToastStore } from "@/features/notifications/store/toast.store";

export function FlowErrorScreen() {
  const errorMessage = useAssignmentFlowStore((s) => s.errorMessage);
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const reset = useAssignmentFlowStore((s) => s.reset);
  const setErrorMessage = useAssignmentFlowStore((s) => s.setErrorMessage);
  const resetData = useAssignmentDataStore((s) => s.reset);
  const retryCreateAssignment = useAssignmentDataStore((s) => s.retryCreateAssignment);
  const loading = useAssignmentDataStore((s) => s.loading);
  const addToast = useToastStore((s) => s.addToast);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header>
        <h2 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
          Something went wrong
        </h2>
      </header>

      <div className="mt-6 flex-1 overflow-y-auto pr-2">
        <div className="mx-auto w-full max-w-[900px] rounded-[24px] bg-white p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f3734f]/10 text-[#f3734f]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                {errorMessage ?? "Please try again."}
              </div>
              <p className="mt-2 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                Backend generation failed for this assignment. You can retry to regenerate.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              className="h-10 rounded-full bg-white px-6 text-base font-medium text-[rgba(48,48,48,1)] shadow-none"
              onClick={() => {
                reset();
                resetData();
                setStep("idle");
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-10 rounded-full bg-[#15171b] px-6 text-base font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
              disabled={loading}
              onClick={() => {
                // Important: do NOT reset the flow payload. Retry uses it to re-run the generation job.
                setErrorMessage(null);
                addToast({
                  type: "info",
                  message: "Retrying…",
                  timeoutMs: 2200,
                });
                void retryCreateAssignment()
                  .then(() => {
                    setStep("processing");
                  })
                  .catch((e) => {
                    const msg = e instanceof Error ? e.message : "Retry failed.";
                    setErrorMessage(msg);
                    addToast({ type: "error", message: msg, timeoutMs: 5200 });
                    setStep("error");
                  });
              }}
            >
              {loading ? "Retrying…" : "Try Again"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

