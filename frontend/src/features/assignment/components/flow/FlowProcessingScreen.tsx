"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useAssignmentDataStore } from "@/features/assignment/store/assignment-data.store";
import { useToastStore } from "@/features/notifications/store/toast.store";
import { useAssignmentGenerationWebsocket } from "@/lib/websocket/hooks/useAssignmentGenerationWebsocket";

export function FlowProcessingScreen() {
  const step = useAssignmentFlowStore((s) => s.step);
  const progress = useAssignmentFlowStore((s) => s.progress);
  const setProgress = useAssignmentFlowStore((s) => s.setProgress);
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const setErrorMessage = useAssignmentFlowStore((s) => s.setErrorMessage);
  const payload = useAssignmentFlowStore((s) => s.payload);
  const addToast = useToastStore((s) => s.addToast);

  const barWidthClass =
    progress >= 100 ? "w-full" : progress >= 75 ? "w-3/4" : progress >= 50 ? "w-2/4" : progress >= 25 ? "w-1/4" : "w-0";

  const phase = useAssignmentDataStore((s) => s.phase);
  const resetData = useAssignmentDataStore((s) => s.reset);

  const assignmentId = useAssignmentDataStore((s) => s.currentAssignmentId);
  const fetchAssignment = useAssignmentDataStore((s) => s.fetchAssignment);
  const setProcessingProgress = useAssignmentDataStore((s) => s.setProcessingProgress);
  const setCompletedPhase = useAssignmentDataStore((s) => s.setCompletedPhase);
  const setFailed = useAssignmentDataStore((s) => s.setFailed);

  const doneRef = useRef(false);

  useAssignmentGenerationWebsocket({
    assignmentId,
    enabled: step === "processing" && Boolean(assignmentId),
    onStarted: () => {
      setErrorMessage(null);
      setProgress(0);
      setProcessingProgress(0);
      addToast({
        type: "info",
        message: "Generation started. This usually takes a moment…",
        timeoutMs: 2600,
      });
    },
    onProgress: (evt) => {
      const p = typeof evt.progress === "number" ? Math.round(evt.progress) : 0;
      setProgress(p);
      setProcessingProgress(p);
    },
    onCompleted: () => {
      setProgress(100);
      setCompletedPhase();
      // Fetch structured result first, then switch UI.
      void fetchAssignment()
        .then(() => {
          setStep("completed");
          addToast({
            type: "success",
            message: "Question paper generated successfully.",
            timeoutMs: 3200,
          });
        })
        .catch((e) => {
          setErrorMessage(e instanceof Error ? e.message : "Failed to fetch generated paper.");
          setStep("error");
          addToast({
            type: "error",
            message: e instanceof Error ? e.message : "Failed to fetch generated paper.",
            timeoutMs: 4500,
          });
        });
    },
    onFailed: (evt) => {
      const message = evt.error ?? evt.message ?? "Assignment generation failed.";
      setErrorMessage(message);
      setFailed(message);
      setStep("error");
      addToast({
        type: "error",
        message,
        timeoutMs: 5200,
      });
    },
  });

  // Watchdog polling: if WebSocket events are delayed/missed, confirm backend state.
  useEffect(() => {
    if (!(step === "processing" && assignmentId)) return;

    doneRef.current = false;
    let failCount = 0;

    // AI + queue + PDF on Render often exceeds a few minutes; don't fail the UI too early.
    const maxMs = 600_000; // 10 minutes
    const pollMs = 2500;

    const timeoutId = window.setTimeout(() => {
      if (doneRef.current) return;
      doneRef.current = true;
      const msg = "Generation is taking longer than expected. Please retry.";
      setErrorMessage(msg);
      setFailed(msg);
      setStep("error");
      addToast({ type: "error", message: msg, timeoutMs: 5200 });
    }, maxMs);

    const intervalId = window.setInterval(() => {
      if (doneRef.current) return;
      void (async () => {
        try {
          await fetchAssignment();
          const currentPhase = useAssignmentDataStore.getState().phase;
          if (currentPhase === "completed") {
            doneRef.current = true;
            setStep("completed");
          }
          if (currentPhase === "error") {
            doneRef.current = true;
            setStep("error");
          }
        } catch {
          failCount += 1;
          if (failCount >= 4) {
            doneRef.current = true;
            const msg = "Failed to fetch generation status. Please retry.";
            setErrorMessage(msg);
            setFailed(msg);
            setStep("error");
            addToast({ type: "error", message: msg, timeoutMs: 5200 });
          }
        }
      })();
    }, pollMs);

    return () => {
      doneRef.current = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [step, assignmentId, fetchAssignment, setErrorMessage, setFailed, setStep, addToast]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header>
        <h2 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
          Processing
        </h2>
        <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
          Generating your question paper {payload?.title ? `for ${payload.title}` : ""}
        </p>
      </header>

      <div className="mt-6 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[900px] rounded-[24px] bg-white p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#15171b]/10">
              <Loader2 className="h-6 w-6 animate-spin text-[#15171b]" />
            </div>
            <div className="min-w-0">
              <div className="text-[16px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                AI is generating…
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-[#e7e7e7]">
                <div className={`h-2 rounded-full bg-[#15171b] ${barWidthClass}`} />
              </div>
              <div className="mt-2 text-[12px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                {progress}%
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="secondary"
              className="h-10 rounded-full bg-white px-6 text-base font-medium text-[rgba(48,48,48,1)] shadow-none"
              onClick={() => {
                resetData();
                setStep("idle");
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-10 rounded-full bg-[#15171b] px-6 text-base font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
              disabled={phase !== "completed"}
              onClick={() => setStep("completed")}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

