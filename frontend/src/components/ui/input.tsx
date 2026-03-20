import type { InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300",
        className,
      )}
      {...props}
    />
  );
}
