"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Mic, Plus, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useAssignmentFormStore } from "@/features/assignment/store/assignment-form.store";
import { useAssignmentDataStore } from "@/features/assignment/store/assignment-data.store";
import { useToastStore } from "@/features/notifications/store/toast.store";

const questionTypeOptions = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
] as const;

export function CreateAssignmentForm() {
  const { draft, updateDraft } = useAssignmentFormStore();
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const setPayload = useAssignmentFlowStore((s) => s.setPayload);
  const setFile = useAssignmentFlowStore((s) => s.setFile);
  const file = useAssignmentFlowStore((s) => s.file);
  const setErrorMessage = useAssignmentFlowStore((s) => s.setErrorMessage);
  const setProgress = useAssignmentFlowStore((s) => s.setProgress);

  const createAssignment = useAssignmentDataStore((s) => s.createAssignment);
  const loading = useAssignmentDataStore((s) => s.loading);
  const addToast = useToastStore((s) => s.addToast);

  const [dragActive, setDragActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listenTimerRef = useRef<number | null>(null);

  const totalQuestions = useMemo(
    () => draft.questionTypes.reduce((sum, qt) => sum + qt.count, 0),
    [draft.questionTypes],
  );
  const totalMarks = useMemo(
    () => draft.questionTypes.reduce((sum, qt) => sum + qt.count * qt.marks, 0),
    [draft.questionTypes],
  );

  useEffect(() => {
    if (draft.questionTypes.length > 0) return;
    updateDraft({
      questionTypes: [
        { type: questionTypeOptions[0], count: 4, marks: 1 },
        { type: questionTypeOptions[1], count: 3, marks: 2 },
        { type: questionTypeOptions[2], count: 5, marks: 5 },
        { type: questionTypeOptions[3], count: 5, marks: 5 },
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const f = e.dataTransfer.files?.[0];
    if (!f) return;

    setErrorMessage(null);
    setFile({ name: f.name, size: f.size, type: f.type });
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    setErrorMessage(null);
    setFile({ name: f.name, size: f.size, type: f.type });
  }

  function updateTypeAt(idx: number, nextType: string) {
    const next = [...draft.questionTypes];
    next[idx] = { ...next[idx], type: nextType };
    updateDraft({ questionTypes: next });
  }

  function updateCountAt(idx: number, delta: number) {
    const next = [...draft.questionTypes];
    next[idx] = { ...next[idx], count: Math.max(0, next[idx].count + delta) };
    updateDraft({ questionTypes: next });
  }

  function updateMarksAt(idx: number, delta: number) {
    const next = [...draft.questionTypes];
    next[idx] = { ...next[idx], marks: Math.max(0, next[idx].marks + delta) };
    updateDraft({ questionTypes: next });
  }

  function removeRow(idx: number) {
    const next = draft.questionTypes.filter((_, i) => i !== idx);
    updateDraft({ questionTypes: next });
  }

  function addRow() {
    updateDraft({
      questionTypes: [
        ...draft.questionTypes,
        { type: "Multiple Choice Questions", count: 1, marks: 1 },
      ],
    });
  }

  function handleToggleVoice() {
    if (listenTimerRef.current) {
      window.clearTimeout(listenTimerRef.current);
      listenTimerRef.current = null;
    }

    setIsListening((prev) => {
      const next = !prev;
      if (next) {
        listenTimerRef.current = window.setTimeout(() => {
          setIsListening(false);
          listenTimerRef.current = null;
        }, 2500) as unknown as number;
      }
      return next;
    });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full border-4 border-[rgba(75,194,109,0.4)] bg-[rgba(75,194,109,1)] shadow-[0_32px_48px_0_rgba(0,0,0,0.2),0_16px_48px_0_rgba(0,0,0,0.12)]" />
          <div>
            <h2 className="text-[28px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              Create Assignment
            </h2>
            <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
              Set up a new assignment for your students
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 text-[rgba(48,48,48,1)]"
          aria-label="Back to idle"
          onClick={() => setStep("idle")}
        >
          <ArrowLeft size={20} />
        </button>
      </header>

      <div className="mt-6 flex-1 overflow-y-auto pr-2">
        <div className="mx-auto w-full max-w-[900px] rounded-[24px] bg-white p-6 shadow-sm">
          <h3 className="text-[16px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
            Assignment Details
          </h3>
          <p className="mt-1 mb-6 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
            Basic information about your assignment
          </p>

          {/* Upload */}
          <div className="mb-6">
            <div
              className={`flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed p-10 text-center transition ${
                dragActive ? "border-[#10b981] bg-[#ecfdf5]" : "border-[#d6d6d6] bg-white"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDragActive(false);
              }}
              onDrop={onDrop}
            >
              <UploadCloud size={36} className="text-[rgba(94,94,94,1)]" aria-hidden="true" />
              <p className="mt-4 text-[14px] font-medium leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                Choose a file or drag & drop it here
              </p>
              <p className="mt-2 text-[12px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                JPG, PNG, Upto 10MB
              </p>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={onPickFile}
                accept=".jpg,.jpeg,.png,.pdf,.txt"
              />

              <Button
                variant="secondary"
                className="mt-4 h-10 rounded-full border border-[#e7e7e7] bg-[#f3f3f3] px-6 text-base font-medium text-[rgba(48,48,48,1)] shadow-none hover:bg-[#ececec]"
                onClick={() => inputRef.current?.click()}
              >
                Browse Files
              </Button>

              {file ? (
                <p className="mt-3 text-sm font-medium leading-[140%] tracking-[-0.04em] text-[#10b981]">
                  Uploaded: {file.name}
                </p>
              ) : null}
            </div>
          </div>

          {/* Assignment Title */}
          <div className="mb-6">
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                Assignment Title
              </span>
              <input
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                placeholder="e.g., CBSE Grade 8 Science - Chapter 3"
                className="h-11 w-full rounded-full border border-[#e7e7e7] bg-white px-4 text-[14px] text-[rgba(48,48,48,1)] outline-none placeholder:text-[rgba(148,148,148,1)]"
              />
            </label>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                Due Date
              </span>
              <input
                type="date"
                value={draft.dueDate}
                onChange={(e) => updateDraft({ dueDate: e.target.value })}
                className="h-11 w-full rounded-full border border-[#e7e7e7] bg-white px-4 text-[14px] text-[rgba(48,48,48,1)] outline-none"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                Chapter
              </span>
              <input
                value={draft.chapterId}
                onChange={(e) => updateDraft({ chapterId: e.target.value })}
                placeholder="Choose a chapter"
                className="h-11 w-full rounded-full border border-[#e7e7e7] bg-white px-4 text-[14px] text-[rgba(48,48,48,1)] outline-none placeholder:text-[rgba(148,148,148,1)]"
              />
            </label>
          </div>

          {/* Question types */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                Question Type
              </div>
              <div className="flex items-center gap-10 text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                <span>No. of Questions</span>
                <span>Marks</span>
              </div>
            </div>

            <div className="space-y-3">
              {draft.questionTypes.map((qt, idx) => (
                <div key={qt.type + idx} className="flex items-center gap-3">
                  <select
                    className="flex-1 h-11 rounded-full bg-[#f3f3f3] px-4 text-[14px] font-medium text-[rgba(48,48,48,1)] outline-none"
                    value={qt.type}
                    onChange={(e) => updateTypeAt(idx, e.target.value)}
                    aria-label="Question type"
                  >
                    {questionTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="flex h-10 w-6 items-center justify-center rounded-full text-[rgba(48,48,48,1)] hover:bg-[#ededed]"
                    aria-label="Remove question type"
                    onClick={() => removeRow(idx)}
                  >
                    <X size={16} />
                  </button>

                  {/* Counts */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-11 w-[66px] items-center gap-2 rounded-full bg-[#f3f3f3] px-2">
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[rgba(94,94,94,1)]"
                        onClick={() => updateCountAt(idx, -1)}
                        aria-label="Decrease question count"
                      >
                        −
                      </button>
                      <span className="text-[14px] font-bold text-[rgba(48,48,48,1)]">
                        {qt.count}
                      </span>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[rgba(94,94,94,1)]"
                        onClick={() => updateCountAt(idx, 1)}
                        aria-label="Increase question count"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Marks */}
                  <div className="flex h-11 w-[66px] items-center gap-2 rounded-full bg-[#f3f3f3] px-2">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[rgba(94,94,94,1)]"
                      onClick={() => updateMarksAt(idx, -1)}
                      aria-label="Decrease marks"
                    >
                      −
                    </button>
                    <span className="text-[14px] font-bold text-[rgba(48,48,48,1)]">
                      {qt.marks}
                    </span>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[rgba(94,94,94,1)]"
                      onClick={() => updateMarksAt(idx, 1)}
                      aria-label="Increase marks"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 inline-flex items-center gap-2 text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]"
              onClick={addRow}
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#15171b] text-white">
                <Plus size={18} />
              </span>
              Add Question Type
            </button>

            <div className="mt-4 flex justify-end text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              <div className="text-right">
                <div>Total Questions: {totalQuestions}</div>
                <div>Total Marks: {totalMarks}</div>
              </div>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 rounded-[24px] bg-white p-4">
            <div className="text-[14px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              Additional Information (For better output)
            </div>
            <div className="relative mt-3">
              <textarea
                className="h-24 w-full resize-none rounded-xl bg-[#f3f3f3] px-4 py-3 pr-12 text-[14px] leading-[140%] tracking-[-0.04em] outline-none placeholder:text-[rgba(148,148,148,1)]"
                value={draft.instructions ?? ""}
                onChange={(e) => updateDraft({ instructions: e.target.value })}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
              />
              <button
                type="button"
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                onClick={handleToggleVoice}
                className="absolute bottom-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_10px_22px_rgba(0,0,0,0.08)] transition-colors hover:bg-[#f5f5f5]"
              >
                <Mic size={18} className={isListening ? "text-[#10b981]" : "text-[rgba(48,48,48,1)]"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-4 flex items-center justify-between">
        <Button
          variant="secondary"
          className="h-10 gap-2 rounded-full bg-white px-4"
          onClick={() => setStep("idle")}
        >
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="h-10 gap-2 rounded-full bg-white px-4"
            onClick={() => {
              setPayload({
                title: draft.title,
                dueDate: draft.dueDate,
                chapterId: draft.chapterId,
                questionTypes: draft.questionTypes,
                instructions: draft.instructions,
              });
              setStep("uploading");
            }}
          >
            Upload
          </Button>
          <Button
            disabled={loading}
            aria-disabled={loading}
            className="h-10 gap-2 rounded-full bg-[#15171b] px-4 text-white shadow-none disabled:opacity-60"
            onClick={async () => {
              setPayload({
                title: draft.title,
                dueDate: draft.dueDate,
                chapterId: draft.chapterId,
                questionTypes: draft.questionTypes,
                instructions: draft.instructions,
              });

              const title = draft.title.trim();
              const chapterId = draft.chapterId.trim();
              const dueDate = draft.dueDate;
              const questionTypes = draft.questionTypes;
              const hasQuestionRows = questionTypes.length > 0;
              const isValidRows =
                hasQuestionRows &&
                questionTypes.every((qt) => qt.count > 0 && qt.marks >= 0);
              const canSend = Boolean(title && chapterId && dueDate && isValidRows && totalQuestions > 0);

              if (!canSend) {
                setErrorMessage("Please complete the required fields before generating.");
                setStep("error");
                return;
              }

              setErrorMessage(null);
              setProgress(0);

              try {
                await createAssignment();
                // Backend job is triggered; we can move to processing immediately.
                setStep("processing");
                addToast({
                  type: "success",
                  message: "Assignment created. Generating your question paper…",
                  timeoutMs: 3200,
                });
              } catch (e) {
                setErrorMessage(e instanceof Error ? e.message : "Failed to generate assignment.");
                setStep("error");
                addToast({
                  type: "error",
                  message: e instanceof Error ? e.message : "Failed to generate assignment.",
                  timeoutMs: 4500,
                });
              }
            }}
          >
            {loading ? "Generating…" : "Generate"}
          </Button>
        </div>
      </footer>
    </div>
  );
}

