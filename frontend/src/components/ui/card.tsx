import type { PropsWithChildren } from "react";
import { clsx } from "clsx";

type CardProps = PropsWithChildren<{
  className?: string;
}>;

export function Card({ children, className }: CardProps) {
  return (
    <article className={clsx("rounded-3xl bg-white p-6 shadow-sm", className)}>
      {children}
    </article>
  );
}
