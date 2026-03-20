"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Grid2x2, LibraryBig, Users } from "lucide-react";

const navItems = [
  { label: "Home", icon: Grid2x2, href: "/" },
  { label: "My Groups", icon: Users, href: "/groups" },
  { label: "Library", icon: LibraryBig, href: "/library" },
  // Match your screenshot wording: "AI Toolkit"
  { label: "AI Toolkit", icon: BookOpenText, href: "/toolkit" },
  // Note: Assignments is intentionally omitted to match the mobile mockup.
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-32px)] max-w-[420px] -translate-x-1/2 rounded-[24px] bg-[#15171b] px-2 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
    >
      <div className="flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isHomeItem = item.href === "/";
          const isActive = isHomeItem ? pathname === "/" || pathname === "/home" : pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-1 py-2"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={20}
                className={isActive ? "text-white" : "text-[#8f8f8f]"}
                strokeWidth={isActive ? 2.2 : 2}
              />
              <span
                className={[
                  "truncate text-[11px] font-semibold leading-[14px]",
                  isActive ? "text-white" : "text-[#8f8f8f]",
                ].join(" ")}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

