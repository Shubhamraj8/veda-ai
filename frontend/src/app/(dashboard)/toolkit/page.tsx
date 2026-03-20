"use client";

import { BarChart3, ClipboardCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";

const toolkitFeatures = [
  {
    title: "AI Question Generation",
    description: "Generate chapter-aligned, mark-aware questions with multiple difficulty levels in one click.",
    icon: Sparkles,
  },
  {
    title: "Automated Grading",
    description: "Evaluate submissions consistently against rubrics to reduce manual correction workload.",
    icon: ClipboardCheck,
  },
  {
    title: "Analytics",
    description: "Track class performance trends, identify weak concepts, and plan targeted interventions.",
    icon: BarChart3,
  },
];

export default function ToolkitPage() {
  const router = useRouter();
  const setStep = useAssignmentFlowStore((s) => s.setStep);

  return (
    <section className="h-full min-h-0 overflow-y-auto rounded-2xl bg-[#f5f5f5] p-6 [font-family:var(--font-bricolage)]">
      <div className="mx-auto flex min-h-full w-full max-w-[1120px] flex-col items-center justify-center gap-10 text-center">
        <header className="max-w-[820px]">
          <h1 className="text-[52px] font-bold leading-[110%] tracking-[-0.05em] text-[rgba(48,48,48,1)]">
            Create Assignments in Seconds with AI
          </h1>
          <p className="mx-auto mt-4 max-w-[680px] text-[18px] leading-[145%] tracking-[-0.03em] text-[rgba(94,94,94,1)]">
            VedaAI helps teachers design high-quality assessments faster, personalize question strategy, and
            accelerate grading without sacrificing academic rigor.
          </p>
        </header>

        <button
          type="button"
          className="inline-flex h-14 items-center justify-center rounded-full bg-[#15171b] px-10 text-[18px] font-semibold leading-[140%] tracking-[-0.03em] text-white shadow-[0_18px_32px_rgba(0,0,0,0.2)] hover:bg-[#22252a]"
          onClick={() => {
            setStep("creating");
            router.push("/assignments");
          }}
        >
          Create Assignment
        </button>

        {/* Optional graphic placeholder */}
        <div className="flex h-[140px] w-full max-w-[760px] items-center justify-center rounded-3xl border border-dashed border-[#d7d7d7] bg-white/70">
          <div className="text-[14px] font-medium tracking-[-0.04em] text-[rgba(94,94,94,1)]">
            AI Assignment Workflow Preview
          </div>
        </div>

        <section className="grid w-full grid-cols-1 gap-4 md:grid-cols-3">
          {toolkitFeatures.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rounded-3xl bg-white p-6 text-left shadow-sm">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#15171b] text-white">
                  <Icon size={20} />
                </div>
                <h2 className="mt-4 text-[18px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                  {feature.title}
                </h2>
                <p className="mt-2 text-[14px] leading-[145%] tracking-[-0.03em] text-[rgba(94,94,94,1)]">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>
      </div>
    </section>
  );
}

