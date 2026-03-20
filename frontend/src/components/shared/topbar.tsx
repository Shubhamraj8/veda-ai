"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Bell, ChevronDown, Grid2x2, GraduationCap, Settings as SettingsIcon, User, LogOut } from "lucide-react";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import { DropdownMenu } from "@/components/shared/dropdown-menu";
import { useSchoolBrandingStore } from "@/features/school/store/school-branding.store";

export function Topbar() {
  const router = useRouter();
  const setStep = useAssignmentFlowStore((s) => s.setStep);
  const schoolLogoDataUrl = useSchoolBrandingStore((s) => s.logoDataUrl);
  const clearSchoolLogo = useSchoolBrandingStore((s) => s.clearSchoolLogo);

  const dropdownItems = [
    {
      key: "profile",
      label: "Profile",
      href: "/settings",
      icon: <User size={16} />,
    },
    {
      key: "settings",
      label: "Settings",
      href: "/settings",
      icon: <SettingsIcon size={16} />,
    },
    {
      key: "school",
      label: "School Account",
      href: "/school",
      icon: <GraduationCap size={16} />,
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogOut size={16} />,
      onSelect: () => {
        // UI-only logout for now.
        setStep("idle");
        clearSchoolLogo();
        router.push("/home");
      },
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between rounded-none bg-[#efefef] pl-3 pr-3 shadow-sm md:rounded-2xl md:pl-6">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Go back"
          className="inline-flex h-6 w-6 items-center justify-center text-[#454545] transition-colors hover:text-[#2f2f2f]"
          onClick={() => {
            setStep("idle");
            router.push("/assignments");
          }}
        >
          <ArrowLeft size={24} strokeWidth={2.25} />
        </button>
        <Grid2x2 size={18} className="text-[#9e9e9e]" />
        <h1 className="h-[19px] w-[87px] text-base font-medium leading-[19px] text-[#9e9e9e]">Assignment</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="relative rounded-full p-1 text-[#444] transition-colors hover:bg-[#e5e5e5]"
          aria-label="Notifications"
        >
          <Bell size={20} strokeWidth={2} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-orange-500" />
        </button>

        <DropdownMenu
          items={dropdownItems}
          trigger={
            <button
              type="button"
              className="inline-flex h-9 items-center gap-2 rounded-full bg-[#f4f4f4] px-2.5 text-base font-semibold text-[#2f2f2f] transition-colors hover:bg-[#ebebeb]"
            >
              <img
                src={schoolLogoDataUrl ?? "/images/monkey-logo.png"}
                alt="User avatar"
                className="h-6 w-6 rounded-full object-cover"
              />
              <span>John Doe</span>
              <ChevronDown size={16} className="text-[#565656]" />
            </button>
          }
        />
      </div>
    </header>
  );
}
