"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpenCheck, ChartLine, ClipboardCheck, LibraryBig, MessageSquareText, Sparkles } from "lucide-react";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";

const stats = [
  { label: "Assignments Graded", value: "1,284", delta: "+18% this month" },
  { label: "Students Improved", value: "326", delta: "+41 students this week" },
  { label: "Performance Score", value: "92.4%", delta: "+3.1% vs last term" },
];

const enables = [
  {
    title: "AI Grading Assistant",
    description: "Auto-evaluate objective and structured responses with rubric-based consistency.",
    icon: ClipboardCheck,
  },
  {
    title: "Learning Analytics",
    description: "Track concept mastery by class, chapter, and student cohorts in real time.",
    icon: ChartLine,
  },
  {
    title: "Feedback System",
    description: "Generate actionable feedback with strengths, gaps, and next-step guidance.",
    icon: MessageSquareText,
  },
];

const recentActivity = [
  {
    title: "Class 8 Science - Electricity Quiz",
    detail: "Generated and assigned to 42 students • 18 minutes ago",
    status: "Published",
  },
  {
    title: "Class 7 Math - Linear Equations",
    detail: "AI grading completed for 38 submissions • 1 hour ago",
    status: "Graded",
  },
  {
    title: "Class 6 English - Reading Comprehension",
    detail: "Feedback reports shared with parents • Today, 10:20 AM",
    status: "Shared",
  },
];

const quickActions = [
  {
    title: "Create Assignment",
    description: "Build and assign an AI-assisted worksheet or test.",
    href: "/assignments",
    highlighted: true,
    icon: Sparkles,
  },
  {
    title: "View Analytics",
    description: "Open student and class performance insights.",
    href: "/toolkit",
    highlighted: false,
    icon: ChartLine,
  },
  {
    title: "Open Library",
    description: "Browse saved templates and previous question papers.",
    href: "/library",
    highlighted: false,
    icon: LibraryBig,
  },
];

export default function HomePage() {
  const router = useRouter();
  const setStep = useAssignmentFlowStore((s) => s.setStep);

  return (
    <section className="h-full min-h-0 overflow-y-auto rounded-2xl bg-[#f5f5f5] p-6 [font-family:var(--font-bricolage)]">
      <div className="mx-auto w-full max-w-[1120px] space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-[28px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
            Welcome back, Delhi Public School
          </h1>
          <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
            Monitor classroom outcomes, accelerate grading, and keep your teaching workflow focused on student growth.
          </p>
        </header>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <article key={item.label} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">{item.label}</p>
              <p className="mt-2 text-[32px] font-bold leading-[120%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">{item.value}</p>
              <p className="mt-2 text-[13px] font-medium leading-[140%] tracking-[-0.04em] text-[#10b981]">{item.delta}</p>
            </article>
          ))}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">What VedaAI Enables</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {enables.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-2xl bg-[#f8f8f8] p-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#15171b] text-white">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-3 text-[16px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">{item.title}</h3>
                  <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_1fr]">
          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">Recent Activity</h2>
            <div className="mt-4 space-y-3">
              {recentActivity.map((item) => (
                <div key={item.title} className="flex items-start justify-between rounded-2xl bg-[#f8f8f8] p-4">
                  <div>
                    <p className="text-[15px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">{item.title}</p>
                    <p className="mt-1 text-[13px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">{item.detail}</p>
                  </div>
                  <span className="rounded-full bg-[#e8fff5] px-3 py-1 text-[12px] font-medium text-[#0f9f67]">{item.status}</span>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">Quick Actions</h2>
            <div className="mt-4 space-y-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const sharedClassName = `group flex items-center justify-between rounded-2xl p-4 transition ${
                  action.highlighted
                    ? "bg-[#15171b] text-white"
                    : "bg-[#f8f8f8] text-[rgba(48,48,48,1)] hover:bg-[#efefef]"
                }`;

                if (action.highlighted) {
                  return (
                    <button
                      key={action.title}
                      type="button"
                      className={sharedClassName}
                      onClick={() => {
                        setStep("creating");
                        router.push(action.href);
                      }}
                    >
                      <div className="pr-3">
                        <p className="text-[15px] font-bold leading-[140%] tracking-[-0.04em]">
                          {action.title}
                        </p>
                        <p
                          className={`mt-1 text-[13px] leading-[140%] tracking-[-0.04em] ${
                            action.highlighted ? "text-white/80" : "text-[rgba(94,94,94,1)]"
                          }`}
                        >
                          {action.description}
                        </p>
                      </div>
                      <div
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                          action.highlighted
                            ? "bg-white/15 text-white"
                            : "bg-white text-[rgba(48,48,48,1)]"
                        }`}
                      >
                        {action.highlighted ? <Icon size={16} /> : <ArrowRight size={16} />}
                      </div>
                    </button>
                  );
                }

                return (
                  <Link key={action.title} href={action.href} className={sharedClassName}>
                    <div className="pr-3">
                      <p className="text-[15px] font-bold leading-[140%] tracking-[-0.04em]">
                        {action.title}
                      </p>
                      <p
                        className={`mt-1 text-[13px] leading-[140%] tracking-[-0.04em] ${
                          action.highlighted ? "text-white/80" : "text-[rgba(94,94,94,1)]"
                        }`}
                      >
                        {action.description}
                      </p>
                    </div>
                    <div
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        action.highlighted
                          ? "bg-white/15 text-white"
                          : "bg-white text-[rgba(48,48,48,1)]"
                      }`}
                    >
                      {action.highlighted ? <Icon size={16} /> : <ArrowRight size={16} />}
                    </div>
                  </Link>
                );
              })}
            </div>
          </article>
        </section>

        <section className="rounded-3xl bg-[#15171b] p-6 text-white shadow-sm">
          <div className="flex items-start gap-3">
            <BookOpenCheck size={20} className="mt-1" />
            <div>
              <h3 className="text-[16px] font-bold leading-[140%] tracking-[-0.04em]">Today&apos;s Teaching Focus</h3>
              <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.04em] text-white/80">
                Students showed strongest gains in short-answer scientific reasoning. Consider assigning one more diagram-based practice set for Class 8 to improve visual explanation skills.
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

