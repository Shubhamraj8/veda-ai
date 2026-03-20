"use client";

import type { AriaAttributes, ReactElement, ReactNode } from "react";
import { cloneElement, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";

export type DropdownMenuItem = {
  key: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  icon?: ReactNode;
  danger?: boolean;
};

export function DropdownMenu({
  trigger,
  items,
}: {
  trigger: ReactElement;
  items: DropdownMenuItem[];
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const menuId = useId();

  useEffect(() => {
    function onDocumentMouseDown(e: MouseEvent) {
      const root = rootRef.current;
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocumentMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocumentMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  type TriggerProps = { onClick?: (evt: unknown) => void } & AriaAttributes;
  const typedTrigger = trigger as ReactElement<TriggerProps>;

  const triggerWithHandlers = cloneElement(typedTrigger, {
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": menuId,
    onClick: (e: unknown) => {
      typedTrigger.props.onClick?.(e);
      setOpen((v) => !v);
    },
  });

  return (
    <div ref={rootRef} className="relative">
      {triggerWithHandlers}

      {open ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Profile menu"
          className="absolute right-0 top-[calc(100%+10px)] z-50 w-[240px] rounded-3xl border border-[#e7e7e7] bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.14)]"
        >
          {items.map((item) => (
            <div key={item.key} role="none">
              {item.href ? (
                <Link
                  role="menuitem"
                  href={item.href}
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                  }}
                  className={[
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    item.danger
                      ? "text-[#ff4a4a] hover:bg-[#fff0f0]"
                      : "text-[rgba(48,48,48,1)] hover:bg-[#f3f3f3]",
                  ].join(" ")}
                >
                  {item.icon ? <span className="text-[rgba(94,94,94,1)]">{item.icon}</span> : null}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    item.onSelect?.();
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                    item.danger
                      ? "text-[#ff4a4a] hover:bg-[#fff0f0]"
                      : "text-[rgba(48,48,48,1)] hover:bg-[#f3f3f3]",
                  ].join(" ")}
                >
                  {item.icon ? <span className="text-[rgba(94,94,94,1)]">{item.icon}</span> : null}
                  <span className="truncate">{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

