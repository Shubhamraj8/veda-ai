"use client";

export function EmptyStateIllustration() {
  return (
    <div
      className="relative h-[300px] w-[300px]"
      role="img"
      aria-label="Empty state illustration"
    >
      {/* Decorative background circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-96 w-96 rounded-full bg-white/30 blur-2xl" />
      </div>

      {/* Paper + magnifier group (simplified using the provided HTML shapes) */}
      <div className="absolute left-1/2 top-1/2 flex h-[240px] w-[240px] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
        <div className="relative">
          {/* Magnifying glass circle */}
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-8 border-purple-200 bg-white/60">
            <div className="text-5xl font-bold leading-none text-red-500">×</div>
          </div>

          {/* Purple rotated square highlight */}
          <div className="absolute -bottom-4 -right-4 h-10 w-10 rotate-45 rounded-sm bg-purple-200" />
        </div>
      </div>

      {/* Top-left outlined circle */}
      <div className="absolute left-2 top-6 h-16 w-16 rounded-full border-2 border-gray-400" />

      {/* Blue star */}
      <div className="absolute bottom-10 left-6 text-2xl text-blue-400">✦</div>

      {/* Blue dot */}
      <div className="absolute right-4 top-10 h-3 w-3 rounded-full bg-blue-500" />
    </div>
  );
}

