"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Edit2, Eye, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSchoolBrandingStore } from "@/features/school/store/school-branding.store";

type MemberRole = "Admin" | "Teacher";

type Member = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
};

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[720px] rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f3f3] text-[rgba(48,48,48,1)] hover:bg-[#ececec]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-[18px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function formatMemberRole(role: MemberRole) {
  return role === "Admin" ? "Admin" : "Teacher";
}

function roleTone(role: MemberRole) {
  if (role === "Admin") return "bg-[#15171b] text-white";
  return "bg-[#f3f3f3] text-[rgba(48,48,48,1)]";
}

export default function AccountPage() {
  const [school, setSchool] = useState(() => {
    return {
      name: "Delhi Public School",
      location: "Bokaro Steel City",
      address: "Sector-4, Bokaro Steel City, Jharkhand",
      board: "CBSE",
      contactEmail: "admin@dpsbokaro.edu.in",
      logoFileName: "dps-logo.png",
    };
  });

  const schoolLogoDataUrl = useSchoolBrandingStore((s) => s.logoDataUrl);
  const schoolLogoFileName = useSchoolBrandingStore((s) => s.logoFileName);
  const setSchoolLogo = useSchoolBrandingStore((s) => s.setSchoolLogo);

  const [editOpen, setEditOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([
    { id: "m-1", name: "Lakshya Jain", email: "lakshya.jain@dpsbokaro.edu.in", role: "Admin" },
    { id: "m-2", name: "Neha Verma", email: "neha.verma@dpsbokaro.edu.in", role: "Teacher" },
    { id: "m-3", name: "Rohan Gupta", email: "rohan.gupta@dpsbokaro.edu.in", role: "Teacher" },
  ]);

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<MemberRole>("Teacher");
  const [inviteDone, setInviteDone] = useState(false);

  const [memberModal, setMemberModal] = useState<Member | null>(null);

  const memberCounts = useMemo(() => {
    return members.reduce(
      (acc, m) => {
        if (m.role === "Admin") acc.admin += 1;
        else acc.teacher += 1;
        return acc;
      },
      { admin: 0, teacher: 0 },
    );
  }, [members]);

  return (
    <section className="h-full min-h-0 overflow-y-auto rounded-2xl bg-[#f5f5f5] p-6 [font-family:var(--font-bricolage)]">
      <div className="mx-auto w-full max-w-[1120px] space-y-6">
        {/* Header */}
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-[#15171b]">
                  {/* Use <img> for uploaded data URLs without Next.js image domain restrictions */}
                  <img
                    src={schoolLogoDataUrl ?? "/images/monkey-logo.png"}
                    alt="School logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <h1 className="text-[28px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                  {school.name}
                </h1>
              </div>
              <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                {school.location}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 text-[13px] leading-[140%] tracking-[-0.02em]">
                <span className={`rounded-full px-3 py-1 ${roleTone("Admin")}`}>Admins: {memberCounts.admin}</span>
                <span className={`rounded-full px-3 py-1 ${roleTone("Teacher")}`}>Teachers: {memberCounts.teacher}</span>
              </div>
            </div>

            <Button
              className="h-11 rounded-full px-6"
              variant="secondary"
              onClick={() => setEditOpen(true)}
            >
              <Edit2 size={16} className="mr-2" />
              Edit
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1fr]">
          {/* School Info */}
          <Card title="School Info">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  School Name
                </p>
                <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  {school.name}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  Address
                </p>
                <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  {school.address}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                    Board
                  </p>
                  <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                    {school.board}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                    Contact Email
                  </p>
                  <p className="mt-1 truncate text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                    {school.contactEmail}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Branding */}
          <Card title="Branding">
            <div className="flex items-start gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[#15171b]">
                <img
                  src={schoolLogoDataUrl ?? "/images/monkey-logo.png"}
                  alt="School logo preview"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  School Logo
                </p>
                <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  UI only. Logo changes persist locally for now.
                </p>

                <div className="mt-4">
                  <label className="flex cursor-pointer items-center gap-2 rounded-full bg-[#f3f3f3] px-4 py-2 text-sm font-medium text-[rgba(48,48,48,1)] hover:bg-[#ececec]">
                    <Upload size={16} />
                    Upload logo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        // Read file as data URL so we can show it instantly and persist locally.
                        const reader = new FileReader();
                        reader.onload = () => {
                          const result = typeof reader.result === "string" ? reader.result : null;
                          if (!result) return;
                          setSchool((s) => ({ ...s, logoFileName: file.name }));
                          setSchoolLogo(result, file.name);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <p className="mt-2 text-xs leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                    Selected: {schoolLogoFileName ?? school.logoFileName}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Members */}
        <Card title="Members">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                Manage teachers and admins for your institution.
              </p>
            </div>
            <div className="rounded-3xl bg-[#f3f3f3] px-4 py-2 text-sm font-medium text-[rgba(48,48,48,1)]">
              Total: {members.length}
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="grid grid-cols-[1.2fr_1.6fr_0.8fr_0.9fr] gap-3 rounded-2xl bg-[#f7f7f7] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[rgba(94,94,94,1)]">
                <div>Member</div>
                <div>Email</div>
                <div>Role</div>
                <div>Actions</div>
              </div>

              <div className="space-y-3 py-3">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="grid grid-cols-[1.2fr_1.6fr_0.8fr_0.9fr] items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                        {m.name}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                        {m.email}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${roleTone(m.role)}`}>
                        {formatMemberRole(m.role)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setMemberModal(m)}
                        className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f3] px-3 py-2 text-xs font-medium text-[rgba(48,48,48,1)] hover:bg-[#eaeaea]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const ok = window.confirm(`Remove "${m.name}" from members?`);
                          if (!ok) return;
                          setMembers((prev) => prev.filter((x) => x.id !== m.id));
                        }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#fef7f7] px-3 py-2 text-xs font-medium text-[#ff4a4a] hover:bg-[#fff0f0] border border-[#ffd7d7]"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Invite */}
        <Card title="Invite Members">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.3fr_0.9fr_1fr] md:items-end">
            <div>
              <label className="block">
                <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  Email
                </span>
                <div className="mt-2">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teacher@school.edu"
                    aria-label="Invite email"
                  />
                </div>
              </label>
            </div>

            <div>
              <label className="block">
                <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  Role
                </span>
                <div className="mt-2">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as MemberRole)}
                    className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-slate-300"
                    aria-label="Invite role"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Teacher">Teacher</option>
                  </select>
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="h-11 rounded-full bg-[#15171b] px-6 text-base font-medium text-white shadow-none hover:bg-[#23262c]"
                onClick={() => {
                  if (!inviteEmail.trim()) return;
                  const email = inviteEmail.trim();
                  const name = email.split("@")[0]?.replaceAll(".", " ").replace(/\b\w/g, (c) => c.toUpperCase());
                  const prettyName = name ? name : "New Member";
                  const newMember: Member = { id: `m-${Date.now()}`, name: prettyName, email, role: inviteRole };
                  setMembers((prev) => [newMember, ...prev]);
                  setInviteEmail("");
                  setInviteDone(true);
                  window.setTimeout(() => setInviteDone(false), 1500);
                }}
              >
                <Plus size={16} className="mr-2" />
                Invite
              </Button>
              {inviteDone ? (
                <p className="text-xs leading-[140%] tracking-[-0.02em] text-[#0f9f67]">Invite sent (UI only).</p>
              ) : (
                <p className="text-xs leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  UI only. No backend integration yet.
                </p>
              )}
            </div>
          </div>
        </Card>

        {/* Edit Modal */}
        {editOpen ? (
          <ModalShell title="Edit School Profile" onClose={() => setEditOpen(false)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setEditOpen(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                    School Name
                  </span>
                  <div className="mt-2">
                    <Input
                      value={school.name}
                      onChange={(e) => setSchool((s) => ({ ...s, name: e.target.value }))}
                      aria-label="School name"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                    Location
                  </span>
                  <div className="mt-2">
                    <Input
                      value={school.location}
                      onChange={(e) => setSchool((s) => ({ ...s, location: e.target.value }))}
                      aria-label="School location"
                    />
                  </div>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  Address
                </span>
                <div className="mt-2">
                  <Input
                    value={school.address}
                    onChange={(e) => setSchool((s) => ({ ...s, address: e.target.value }))}
                    aria-label="School address"
                  />
                </div>
              </label>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                    Board
                  </span>
                  <div className="mt-2">
                    <select
                      value={school.board}
                      onChange={(e) => setSchool((s) => ({ ...s, board: e.target.value }))}
                      className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-slate-300"
                      aria-label="School board"
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="ICSE">ICSE</option>
                      <option value="State Board">State Board</option>
                    </select>
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                    Contact email
                  </span>
                  <div className="mt-2">
                    <Input
                      value={school.contactEmail}
                      onChange={(e) => setSchool((s) => ({ ...s, contactEmail: e.target.value }))}
                      aria-label="Contact email"
                    />
                  </div>
                </label>
              </div>

              <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
                <Button variant="secondary" className="h-11 rounded-full" onClick={() => setEditOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="h-11 rounded-full bg-[#15171b] px-6 text-base font-medium text-white shadow-none hover:bg-[#23262c]"
                  type="submit"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </ModalShell>
        ) : null}

        {/* Member View Modal */}
        {memberModal ? (
          <ModalShell title="Member Details" onClose={() => setMemberModal(null)}>
            <div className="space-y-4">
              <div className="rounded-3xl bg-[#f5f5f5] p-4">
                <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  {memberModal.name}
                </p>
                <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  {memberModal.email}
                </p>
                <div className="mt-3">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${roleTone(memberModal.role)}`}>
                    {formatMemberRole(memberModal.role)}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl bg-white p-4 shadow-sm">
                <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                  Future: permissions & activity
                </p>
                <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                  Placeholder for role-specific permissions and audit activity. UI only for now.
                </p>
              </div>
            </div>
          </ModalShell>
        ) : null}
      </div>
    </section>
  );
}

