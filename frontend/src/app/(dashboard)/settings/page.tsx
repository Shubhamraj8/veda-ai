"use client";

import type { ComponentType, ReactNode } from "react";
import { useMemo, useState } from "react";
import Image from "next/image";
import { AlertTriangle, Lock, Mail, Moon, Sun, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SettingsTab = "profile" | "account" | "preferences" | "security";

function SettingsTabsNav({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  const tabs: Array<{
    id: SettingsTab;
    label: string;
    icon: ComponentType<{ size?: number; className?: string }>;
  }> = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Sun },
    { id: "security", label: "Security", icon: Mail },
  ];

  return (
    <nav className="flex w-full flex-col gap-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={[
              "flex h-[48px] w-full items-center gap-3 rounded-2xl px-4 text-left transition-colors",
              isActive ? "bg-[#e7e7e7] text-[rgba(48,48,48,1)]" : "bg-white hover:bg-[#f3f3f3]",
            ].join(" ")}
          >
            <Icon size={16} className={isActive ? "text-[rgba(48,48,48,1)]" : "text-[rgba(94,94,94,1)]"} />
            <span className="text-base font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Card({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={["rounded-3xl bg-white p-6 shadow-sm", className].filter(Boolean).join(" ")}>
      <h2 className="text-[18px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
          {label}
        </span>
        {hint ? (
          <span className="text-xs leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">{hint}</span>
        ) : null}
      </div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function ThemeToggle({ theme, onChange }: { theme: "light" | "dark"; onChange: (t: "light" | "dark") => void }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange("light")}
        className={[
          "inline-flex h-[40px] items-center justify-center gap-2 rounded-full border px-4 transition-colors",
          theme === "light" ? "border-[#15171b] bg-white text-[#15171b]" : "border-[#e7e7e7] bg-white text-[rgba(94,94,94,1)] hover:bg-[#f7f7f7]",
        ].join(" ")}
        aria-pressed={theme === "light"}
      >
        <Sun size={16} />
        <span className="text-sm font-medium">Light</span>
      </button>

      <button
        type="button"
        onClick={() => onChange("dark")}
        className={[
          "inline-flex h-[40px] items-center justify-center gap-2 rounded-full border px-4 transition-colors",
          theme === "dark" ? "border-[#15171b] bg-[#15171b] text-white" : "border-[#e7e7e7] bg-white text-[rgba(94,94,94,1)] hover:bg-[#f7f7f7]",
        ].join(" ")}
        aria-pressed={theme === "dark"}
      >
        <Moon size={16} />
        <span className="text-sm font-medium">Dark</span>
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Profile form (UI only)
  const [profile, setProfile] = useState({
    name: "Lakshya Jain",
    email: "lakshya.jain@dpsbokaro.edu.in",
    schoolName: "Delhi Public School, Bokaro",
  });
  const [profileSaveState, setProfileSaveState] = useState<"idle" | "saved">("idle");

  // Account form (UI only)
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [accountSaveState, setAccountSaveState] = useState<"idle" | "saved">("idle");

  // Preferences (UI only)
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    weeklyDigest: true,
  });

  // Security (UI only)
  const securityItems = useMemo(
    () => [
      { id: "2fa", title: "Two-factor authentication", description: "Add an extra verification step when signing in." },
      { id: "devices", title: "Trusted devices", description: "Manage devices allowed to access your account." },
      { id: "sessions", title: "Active sessions", description: "Review and revoke currently active sessions." },
    ],
    [],
  );

  return (
    <section className="flex h-full min-h-0 flex-col overflow-y-auto rounded-2xl bg-[#f5f5f5] p-6">
      <div className="grid h-full min-h-0 grid-cols-[280px_1fr] gap-6">
        <div className="self-start">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#15171b]">
                <Image src="/images/monkey-logo.png" alt="Profile" fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                  Settings
                </p>
                <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  User control panel
                </p>
              </div>
            </div>
            <div className="mt-5">
              <SettingsTabsNav activeTab={activeTab} onTabChange={setActiveTab} />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          {activeTab === "profile" ? (
            <div className="space-y-5">
              <Card title="Profile">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Name">
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Full name"
                      aria-label="Name"
                    />
                  </Field>

                  <Field label="Email">
                    <Input
                      value={profile.email}
                      onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                      placeholder="Email address"
                      aria-label="Email"
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="School Name">
                      <Input
                        value={profile.schoolName}
                        onChange={(e) => setProfile((p) => ({ ...p, schoolName: e.target.value }))}
                        placeholder="School"
                        aria-label="School Name"
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                    Changes are applied locally for now.
                  </p>
                  <div className="flex items-center gap-3">
                    {profileSaveState === "saved" ? (
                      <span className="text-sm font-medium text-[#0f9f67]">Saved</span>
                    ) : null}
                    <Button
                      variant="secondary"
                      className="h-11"
                      onClick={() => {
                        setProfileSaveState("saved");
                        window.setTimeout(() => setProfileSaveState("idle"), 1400);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {activeTab === "account" ? (
            <div className="space-y-5">
              <Card title="Change Password">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Current password">
                    <Input
                      type="password"
                      value={passwords.current}
                      onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))}
                      placeholder="••••••••"
                      aria-label="Current password"
                    />
                  </Field>

                  <Field label="New password">
                    <Input
                      type="password"
                      value={passwords.next}
                      onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))}
                      placeholder="Create a new password"
                      aria-label="New password"
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field label="Confirm new password" hint="Must match">
                      <Input
                        type="password"
                        value={passwords.confirm}
                        onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
                        placeholder="Re-enter new password"
                        aria-label="Confirm new password"
                      />
                    </Field>
                  </div>
                </div>

                <div className="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  {accountSaveState === "saved" ? <span className="text-sm font-medium text-[#0f9f67]">Saved</span> : null}
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="h-11"
                      onClick={() => {
                        setAccountSaveState("saved");
                        window.setTimeout(() => setAccountSaveState("idle"), 1400);
                      }}
                    >
                      Update Password
                    </Button>
                    <Button
                      variant="ghost"
                      className="h-11 text-slate-700 hover:bg-[#f1f1f1]"
                      onClick={() => {
                        // UI only
                        setPasswords({ current: "", next: "", confirm: "" });
                        setAccountSaveState("idle");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>

              <Card title="Account Actions" className="bg-[#fef7f7]">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                      Logout
                    </p>
                    <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                      UI only. No backend integration yet.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    className="h-11"
                    onClick={() => {
                      // UI only
                    }}
                  >
                    Logout
                  </Button>
                </div>

                <div className="mt-6 rounded-3xl border border-[#ffd7d7] bg-white p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-1 text-[#ff5c5c]" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[#15171b]">
                        Delete account
                      </p>
                      <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                        Danger zone. This action is not connected yet.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <Button
                      variant="secondary"
                      className="h-11 bg-white text-[#ff4a4a] hover:bg-[#fff0f0] border border-[#ff4a4a]"
                      onClick={() => {
                        // UI only
                      }}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          {activeTab === "preferences" ? (
            <div className="space-y-5">
              <Card title="Theme">
                <div className="mt-2">
                  <ThemeToggle theme={theme} onChange={setTheme} />
                </div>
                <p className="mt-4 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  Toggle UI only. Persisting theme is not implemented yet.
                </p>
              </Card>

              <Card title="Notification Preferences">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications((n) => ({ ...n, email: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-[rgba(48,48,48,1)]">Email updates</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3">
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) => setNotifications((n) => ({ ...n, sms: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-[rgba(48,48,48,1)]">SMS alerts</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-white px-4 py-3 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={notifications.weeklyDigest}
                      onChange={(e) => setNotifications((n) => ({ ...n, weeklyDigest: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    <span className="text-sm font-medium text-[rgba(48,48,48,1)]">Weekly digest</span>
                    <span className="ml-auto text-xs text-[rgba(94,94,94,1)]">Recommended for teachers</span>
                  </label>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  className="h-11"
                  onClick={() => {
                    // UI only
                  }}
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          ) : null}

          {activeTab === "security" ? (
            <div className="space-y-5">
              <Card title="Security Settings">
                <div className="space-y-4">
                  {securityItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 rounded-3xl border border-[#e7e7e7] bg-white p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <Button
                          variant="ghost"
                          className="h-10 bg-[#f5f5f5] text-[rgba(48,48,48,1)] hover:bg-[#ececec]"
                          onClick={() => {
                            // UI only placeholder
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl bg-[#f8f8f8] p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={18} className="mt-1 text-[#9e9e9e]" />
                    <div>
                      <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                        Placeholder
                      </p>
                      <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                        Security settings are not connected to backend yet.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

