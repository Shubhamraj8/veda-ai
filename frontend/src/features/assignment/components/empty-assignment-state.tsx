import { Button } from "@/components/ui/button";

export function EmptyAssignmentState() {
  return (
    <section className="flex min-h-[560px] flex-col items-center justify-center rounded-3xl bg-[#f3f3f3] px-6 text-center">
      <div className="mb-6 h-40 w-40 rounded-full bg-slate-200/60" aria-hidden="true" />
      <h2 className="mb-2 text-3xl font-semibold text-slate-900">No assignments yet</h2>
      <p className="mb-8 max-w-xl text-slate-500">
        Create your first assignment to start collecting and grading student submissions.
      </p>
      <Button className="h-12 px-7">+ Create Your First Assignment</Button>
    </section>
  );
}
