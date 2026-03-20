"use client";

import { useEffect, useMemo } from "react";
import { env } from "@/lib/constants/env";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useAssignmentDataStore } from "@/features/assignment/store/assignment-data.store";

export function FlowCompletedScreen() {
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const setErrorMessage = useAssignmentFlowStore((s) => s.setErrorMessage);
  const currentAssignment = useAssignmentDataStore((s) => s.currentAssignment);
  const generatedSections = useAssignmentDataStore((s) => s.generatedSections);
  const fetchAssignment = useAssignmentDataStore((s) => s.fetchAssignment);

  const assetUrl = useMemo(() => {
    const fileUrl = currentAssignment?.fileUrl;
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
    return new URL(fileUrl, env.wsUrl).toString();
  }, [currentAssignment?.fileUrl]);

  useEffect(() => {
    // The backend can emit "completed" before the PDF worker finishes.
    // Poll until the backend provides `fileUrl`.
    if (currentAssignment?.fileUrl) return;

    let cancelled = false;
    let failCount = 0;
    const maxFails = 5;
    const start = Date.now();
    const maxMs = 45000;

    const intervalId = window.setInterval(() => {
      if (cancelled) return;
      void fetchAssignment()
        .then(() => {
          // no-op; store will update.
        })
        .catch(() => {
          failCount += 1;
          if (failCount >= maxFails || Date.now() - start >= maxMs) {
            setErrorMessage("Failed to load generated paper. Please retry.");
            setStep("error");
          }
        });
    }, 2000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [currentAssignment?.fileUrl, fetchAssignment, setErrorMessage, setStep]);

  return (
    <div className="flex h-full min-h-0 flex-col [font-family:var(--font-inter)]">
      <div className="flex-1 overflow-y-auto pr-2">
        <div className="mx-auto max-w-4xl space-y-6 p-2">
          <div className="flex items-center justify-between rounded-2xl bg-gray-900 p-6 shadow-lg">
            <p className="text-sm md:text-base text-white">
              Question paper generation completed
              {currentAssignment?.title ? ` (${currentAssignment.title})` : ""}
            </p>

            {assetUrl ? (
              <a
                href={assetUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
              >
                ⬇ Download as PDF
              </a>
            ) : (
              <span className="ml-4 text-sm text-white/80">Preparing PDF…</span>
            )}
          </div>

          <div className="rounded-[16px] bg-white p-[40px] shadow-xl">
            <h1 className="text-xl font-semibold text-gray-900">Question paper</h1>
            <p className="mt-2 text-sm text-gray-600">
              Generated from structured backend output (sections/questions).
            </p>

            {!generatedSections ? (
              <div className="mt-6 rounded-3xl bg-[#f3f3f3] p-6 text-sm text-gray-700">
                Preparing your question paper…
              </div>
            ) : (
              <div className="mt-6">
                {generatedSections.map((section, sectionIndex) => (
                  <section key={`${section.title}-${sectionIndex}`} className="mb-6">
                    <h2 className="mb-3 text-center text-lg font-semibold text-gray-900">
                      {section.title}
                    </h2>
                    {section.instruction ? (
                      <p className="mb-3 text-center text-sm text-gray-600">{section.instruction}</p>
                    ) : null}

                    <ol className="list-decimal ml-5 space-y-2">
                      {section.questions.map((q, idx) => (
                        <li key={`${q.text}-${idx}`} className="text-sm text-gray-900">
                          <div className="font-medium">
                            [{q.difficulty}] {q.text}
                          </div>
                          <div className="mt-1 text-xs text-gray-600">
                            {q.marks} marks
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}

                <p className="mt-4 font-medium text-gray-900">End of Question Paper</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="rounded-full bg-[#15171b] px-6 py-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(0,0,0,0.12)]"
                onClick={() => setStep("idle")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

