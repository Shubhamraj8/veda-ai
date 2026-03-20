"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpenText,
  FileText,
  Grid2x2,
  LibraryBig,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { useSchoolBrandingStore } from "@/features/school/store/school-branding.store";

const navItems = [
  { label: "Home", icon: Grid2x2, href: "/" },
  { label: "My Groups", icon: Users, href: "/groups" },
  { label: "Assignments", icon: FileText, href: "/assignments" },
  { label: "AI Teacher's Toolkit", icon: BookOpenText, href: "/toolkit" },
  { label: "My Library", icon: LibraryBig, href: "/library" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const isSettingsActive = pathname === "/settings";
  const isSchoolAccountActive = pathname === "/school";
  const schoolLogoDataUrl = useSchoolBrandingStore((s) => s.logoDataUrl);

  return (
    <aside className="sticky top-3 flex h-[756px] w-[304px] flex-col justify-between rounded-2xl bg-white p-6 shadow-[0_32px_48px_0_rgba(0,0,0,0.2),0_16px_48px_0_rgba(0,0,0,0.12)]">
      <div className="mb-8 flex items-center gap-3">
        <Image src="/images/veda-logo.png" alt="VedaAI logo" width={36} height={36} className="h-9 w-9 rounded-xl object-cover" />
        <span className="h-5 w-[88px] [font-family:var(--font-bricolage)] text-[28px] font-bold leading-5 tracking-[-0.06em] text-[rgba(48,48,48,1)]">
          VedaAI
        </span>
      </div>

      <button
        type="button"
        className="mb-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-[#fe8965] bg-[#252a31] text-base font-medium text-white shadow-sm transition-colors hover:bg-[#2d333b]"
        onClick={() => {
          setStep("creating");
          router.push("/assignments");
        }}
      >
        <Sparkles size={18} className="h-[17px] w-[18px]" />
        <span className="h-7 w-[137px] [font-family:var(--font-inter)] text-base font-medium leading-7 tracking-[-0.04em] text-white">
          Create Assignment
        </span>
      </button>

      <nav aria-label="Sidebar" className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isHomeItem = item.href === "/";
          const isActive = isHomeItem ? pathname === "/" || pathname === "/home" : pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-10 items-center rounded-xl px-3 [font-family:var(--font-bricolage)] text-base leading-[140%] tracking-[-0.04em] ${
                isActive
                  ? "bg-[#e7e7e7] font-normal text-[rgba(48,48,48,1)]"
                  : "font-normal text-[rgba(94,94,94,1)] hover:bg-[#ececec]"
              }`}
            >
              <Icon size={17} className="mr-3 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex w-full flex-col gap-2">
        <Link
          href="/settings"
          className={`flex h-10 w-full items-center gap-2 rounded-xl px-3 [font-family:var(--font-bricolage)] text-base font-normal leading-[140%] tracking-[-0.04em] ${
            isSettingsActive
              ? "bg-[#e7e7e7] text-[rgba(48,48,48,1)]"
              : "text-[rgba(94,94,94,1)] hover:bg-[#ececec]"
          }`}
        >
          <Settings size={16} className="shrink-0" />
          Settings
        </Link>

        <Link
          href="/school"
          className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 ${
            isSchoolAccountActive ? "bg-[#e7e7e7]" : "bg-white hover:bg-[#ececec]"
          }`}
        >
          <img
            src={schoolLogoDataUrl ?? "/images/monkey-logo.png"}
            alt="Delhi Public School logo"
            className="h-14 w-[59px] shrink-0 rounded-full object-cover"
          />
          <div className="flex h-14 w-[232px] items-center">
            <div className="flex w-[165px] flex-col gap-1">
              <div className="h-[22px] w-[165px] [font-family:var(--font-bricolage)] text-base font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                Delhi Public School
              </div>
              <div className="h-[22px] w-[165px] [font-family:var(--font-bricolage)] text-sm font-normal leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                Bokaro Steel City
              </div>
            </div>
          </div>
        </Link>
      </div>
    </aside>
  );
}
