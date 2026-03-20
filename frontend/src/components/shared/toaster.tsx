"use client";

import { useToastStore } from "@/features/notifications/store/toast.store";

function toneClasses(type: "success" | "error" | "info") {
  if (type === "success") return "border-[#10b981]/30 bg-[#ecfdf5] text-[#047857]";
  if (type === "error") return "border-[#ff4a4a]/30 bg-[#fff0f0] text-[#b91c1c]";
  return "border-[#15171b]/20 bg-white text-[rgba(48,48,48,1)]";
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-[1000] flex w-[320px] flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={[
            "rounded-3xl border px-4 py-3 shadow-[0_12px_30px_rgba(0,0,0,0.14)]",
            toneClasses(t.type),
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="text-sm font-medium">{t.message}</div>
        </div>
      ))}
    </div>
  );
}

