"use client";

import type { DragEvent } from "react";
import { useMemo, useRef } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useAssignmentDataStore } from "@/features/assignment/store/assignment-data.store";

export function FileUploadSection() {
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const setFile = useAssignmentFlowStore((s) => s.setFile);
  const setErrorMessage = useAssignmentFlowStore((s) => s.setErrorMessage);
  const file = useAssignmentFlowStore((s) => s.file);
  const setProgress = useAssignmentFlowStore((s) => s.setProgress);
  const payload = useAssignmentFlowStore((s) => s.payload);
  const createAssignment = useAssignmentDataStore((s) => s.createAssignment);
  const loading = useAssignmentDataStore((s) => s.loading);
  const currentAssignmentId = useAssignmentDataStore((s) => s.currentAssignmentId);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const accept = useMemo(() => ".jpg,.jpeg,.png,.pdf,.txt", []);

  function handleFiles(files: FileList | null) {
    const f = files?.[0];
    if (!f) return;
    setFile({ name: f.name, size: f.size, type: f.type });
    setErrorMessage(null);
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header>
        <div className="flex items-center gap-2">
          <h2 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
            Upload your file
          </h2>
        </div>
      </header>

      <div className="mt-6 flex-1 overflow-y-auto pr-2">
        <div className="mx-auto w-full max-w-[900px] rounded-[24px] bg-white p-6">
          <div
            className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#d6d6d6] bg-white py-10"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={onDrop}
          >
            <UploadCloud size={36} className="text-[#9c9c9c]" aria-hidden="true" />
            <p className="mt-4 text-[14px] font-medium leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              Choose a file or drag & drop it here
            </p>
            <p className="mt-2 text-[12px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
              JPG, PNG, Upto 10MB
            </p>

            <div className="mt-4">
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <Button
                className="h-10 rounded-full bg-[#15171b] px-6 text-base font-medium text-white shadow-none"
                onClick={() => inputRef.current?.click()}
              >
                Browse Files
              </Button>
            </div>
          </div>

          {file ? (
            <div className="mt-6 flex items-center gap-3 rounded-2xl bg-[#f5f5f5] px-4 py-3">
              <div className="h-10 w-10 rounded-full bg-[#15171b]/10" aria-hidden="true" />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-bold tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                  {file.name}
                </div>
                <div className="text-[12px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-between">
        <Button
          variant="secondary"
          className="h-10 gap-2 rounded-full bg-white px-6 text-base font-medium text-[rgba(48,48,48,1)] shadow-none"
          onClick={() => setStep("idle")}
        >
          Cancel
        </Button>

        <Button
          className="h-10 gap-2 rounded-full bg-[#15171b] px-6 text-base font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
          onClick={async () => {
            setErrorMessage(null);
            setProgress(0);
            try {
              // If the assignment was already created from the form screen,
              // just move to processing without calling the API again.
              if (!currentAssignmentId) {
                const title = payload?.title?.trim();
                const chapterId = payload?.chapterId?.trim();
                const dueDate = payload?.dueDate;
                const rows = payload?.questionTypes ?? [];
                const isValidRows = rows.length > 0 && rows.every((r) => r.count > 0 && r.marks >= 0);

                if (!title || !chapterId || !dueDate || !isValidRows) {
                  setErrorMessage("Please complete the required fields before generating.");
                  setStep("error");
                  return;
                }
                await createAssignment();
              }
              setStep("processing");
            } catch (e) {
              setErrorMessage(e instanceof Error ? e.message : "Failed to create assignment.");
              setStep("error");
            }
          }}
          disabled={loading}
        >
          Generate
        </Button>
      </footer>
    </div>
  );
}

