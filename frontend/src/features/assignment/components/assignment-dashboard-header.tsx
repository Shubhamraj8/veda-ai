import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AssignmentDashboardHeader() {
  return (
    <header className="mb-4 space-y-3">
      <div className="flex h-[50px] w-full flex-col gap-0.5">
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full border-4 border-[rgba(75,194,109,0.4)] bg-[rgba(75,194,109,1)] shadow-[0_32px_48px_0_rgba(0,0,0,0.2),0_16px_48px_0_rgba(0,0,0,0.12)]"
            aria-hidden="true"
          />
          <h1 className="h-7 w-[121px] [font-family:var(--font-bricolage)] text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
            Assignments
          </h1>
        </div>
        <p className="h-5 w-[301px] [font-family:var(--font-bricolage)] text-sm font-normal leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
          Manage and create assignments for your classes.
        </p>
      </div>

      <div className="flex h-16 w-full items-center gap-3 rounded-2xl border border-[#dddddd] bg-[#f2f2f2] px-3">
        <button
          type="button"
          className="inline-flex h-5 w-[77px] items-center gap-1"
        >
          <SlidersHorizontal size={20} className="h-5 w-5 text-[rgba(169,169,169,1)]" />
          <span className="h-5 w-[53px] [font-family:var(--font-bricolage)] text-sm font-bold leading-[140%] tracking-[-0.04em] text-[rgba(169,169,169,1)]">
            Filter By
          </span>
        </button>

        <div className="relative ml-auto w-[380px]">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-11" placeholder="Search Assignment" />
        </div>
      </div>
    </header>
  );
}
