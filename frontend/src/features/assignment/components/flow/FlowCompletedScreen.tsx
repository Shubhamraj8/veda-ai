"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { env } from "@/lib/constants/env";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useAssignmentDataStore } from "@/features/assignment/store/assignment-data.store";
import type { BackendGeneratedSection } from "@/lib/api/assignments";

const SCHOOL_NAME = "Delhi Public School, Sector-4, Bokaro";

function capitalizeDifficulty(d: string): string {
  if (!d) return "";
  return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
}

function isMcqSection(sectionTitle: string): boolean {
  return /multiple\s*choice|mcq|objective/i.test(sectionTitle);
}

function sumMarksFromPayload(payload: {
  questionTypes?: Array<{ count: number; marks: number }>;
} | null): number {
  if (!payload?.questionTypes?.length) return 20;
  return payload.questionTypes.reduce((s, q) => s + q.count * q.marks, 0);
}

/** If the model put options on separate lines under the stem, use them; otherwise MCQ sections get A–D blanks. */
function splitStemAndOptionLines(text: string): { stem: string; optionLines: string[] } {
  const raw = text.trim();
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length <= 1) return { stem: raw, optionLines: [] };

  const stem = lines[0];
  const rest = lines.slice(1);
  const looksLikeOptions = rest.some((l) => /^[A-Da-d][\.\)]\s*\S/.test(l) || /^\([A-Da-d]\)/.test(l));
  if (looksLikeOptions) return { stem, optionLines: rest };
  return { stem: raw, optionLines: [] };
}

function PaperSectionBlock({
  section,
  questionOffset,
}: {
  section: BackendGeneratedSection;
  questionOffset: number;
}) {
  const mcq = isMcqSection(section.title);

  return (
    <section className="mb-8 break-inside-avoid">
      <h3 className="text-center text-[15px] font-bold text-black">{section.title}</h3>
      {section.instruction ? (
        <p className="mt-2 text-left text-[12px] italic text-black">{section.instruction}</p>
      ) : null}

      <div className="mt-4 space-y-5">
        {section.questions.map((q, idx) => {
          const n = questionOffset + idx + 1;
          const { stem, optionLines } = splitStemAndOptionLines(q.text);
          const showParsedOptions = mcq && optionLines.length >= 2;

          return (
            <div key={`${stem}-${idx}`} className="text-[12px] leading-relaxed text-black">
              <p>
                <span className="font-semibold">{n}.</span>{" "}
                <span className="font-semibold">[{capitalizeDifficulty(q.difficulty)}]</span> {stem}{" "}
                <span className="font-semibold">[{q.marks} Marks]</span>
              </p>

              {showParsedOptions ? (
                <ul className="ml-4 mt-2 list-none space-y-1">
                  {optionLines.map((line, i) => (
                    <li key={i} className="pl-1">
                      {line}
                    </li>
                  ))}
                </ul>
              ) : null}

              {mcq && !showParsedOptions ? (
                <ul className="ml-4 mt-3 list-none space-y-2">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <li key={opt} className="flex gap-2">
                      <span className="font-semibold">({opt})</span>
                      <span className="flex-1 border-b border-dotted border-gray-500" />
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function FlowCompletedScreen() {
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const setErrorMessage = useAssignmentFlowStore((s) => s.setErrorMessage);
  const payload = useAssignmentFlowStore((s) => s.payload);
  const currentAssignment = useAssignmentDataStore((s) => s.currentAssignment);
  const generatedSections = useAssignmentDataStore((s) => s.generatedSections);
  const fetchAssignment = useAssignmentDataStore((s) => s.fetchAssignment);

  const printRef = useRef<HTMLDivElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const assetUrl = useMemo(() => {
    const fileUrl = currentAssignment?.fileUrl;
    if (!fileUrl) return null;
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) return fileUrl;
    return new URL(fileUrl, env.wsUrl).toString();
  }, [currentAssignment?.fileUrl]);

  const subjectLabel = (payload?.chapterId ?? currentAssignment?.title ?? "Subject").trim();
  const classLabel = useMemo(() => {
    const ins = payload?.instructions ?? "";
    const m = ins.match(/class\s*[:=]\s*([^\n,]+)/i);
    if (m) return m[1].trim();
    return "5th";
  }, [payload?.instructions]);

  const timeLabel = useMemo(() => {
    const ins = payload?.instructions ?? "";
    const m = ins.match(/(\d+)\s*(hour|hours|hr|h|minute|minutes|min)\b/i);
    if (m) return `${m[1]} ${m[2].toLowerCase().startsWith("h") ? "hours" : "minutes"}`;
    return "45 minutes";
  }, [payload?.instructions]);

  const maxMarks = useMemo(() => sumMarksFromPayload(payload), [payload]);

  const downloadFormattedPdf = useCallback(async () => {
    const el = printRef.current;
    if (!el) return;
    setPdfBusy(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const safeName = (currentAssignment?.title ?? "question-paper")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${safeName || "question-paper"}.pdf`,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            letterRendering: true,
            logging: false,
            backgroundColor: "#ffffff",
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(el)
        .save();
    } catch (e) {
      console.error(e);
      window.alert("Could not create PDF. Try again or use the server PDF link.");
    } finally {
      setPdfBusy(false);
    }
  }, [currentAssignment?.title]);

  useEffect(() => {
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
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gray-900 p-6 shadow-lg">
            <p className="text-sm text-white md:text-base">
              Question paper generation completed
              {currentAssignment?.title ? ` (${currentAssignment.title})` : ""}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              {generatedSections ? (
                <button
                  type="button"
                  disabled={pdfBusy}
                  onClick={() => void downloadFormattedPdf()}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 disabled:opacity-60"
                >
                  {pdfBusy ? "Preparing PDF…" : "⬇ Download formatted PDF"}
                </button>
              ) : null}
              {assetUrl ? (
                <a
                  href={assetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
                >
                  Server PDF
                </a>
              ) : (
                <span className="text-sm text-white/80">Preparing server PDF…</span>
              )}
            </div>
          </div>

          <div className="rounded-[16px] bg-white p-6 shadow-xl md:p-[40px]">
            <p className="text-sm text-gray-500">Preview matches print / html2canvas export.</p>

            {!generatedSections ? (
              <div className="mt-6 rounded-3xl bg-[#f3f3f3] p-6 text-sm text-gray-700">
                Preparing your question paper…
              </div>
            ) : (
              <div
                ref={printRef}
                id="veda-question-paper-print"
                className="mt-6 bg-white text-black [font-family:Arial,Helvetica,sans-serif]"
                style={{ color: "#000000", backgroundColor: "#ffffff" }}
              >
                <header className="text-center">
                  <h1 className="text-[18px] font-bold leading-tight">{SCHOOL_NAME}</h1>
                  <p className="mt-3 text-[14px] font-bold">Subject: {subjectLabel}</p>
                  <p className="mt-1 text-[14px] font-bold">Class: {classLabel}</p>
                </header>

                <div className="mt-6 flex flex-wrap justify-between gap-2 text-[11px] font-bold">
                  <span>Time Allowed: {timeLabel}</span>
                  <span>Maximum Marks: {maxMarks}</span>
                </div>

                <p className="mt-5 text-[11px] italic leading-relaxed">
                  All questions are compulsory unless stated otherwise.
                </p>

                <div className="mt-5 space-y-3 text-[11px]">
                  <div className="flex flex-wrap gap-1">
                    <span className="font-bold">Name:</span>
                    <span className="min-w-[200px] flex-1 border-b border-black" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="font-bold">Roll Number:</span>
                    <span className="min-w-[200px] flex-1 border-b border-black" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <span className="font-bold">Class: {classLabel} Section:</span>
                    <span className="min-w-[160px] flex-1 border-b border-black" />
                  </div>
                </div>

                <div className="mt-10">
                  {generatedSections.map((section, sectionIndex) => {
                    const questionOffset = generatedSections
                      .slice(0, sectionIndex)
                      .reduce((acc, s) => acc + s.questions.length, 0);
                    return (
                      <PaperSectionBlock
                        key={`${section.title}-${sectionIndex}`}
                        section={section}
                        questionOffset={questionOffset}
                      />
                    );
                  })}
                </div>

                <p className="mt-10 text-center text-[12px] font-bold">End of Question Paper</p>
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
