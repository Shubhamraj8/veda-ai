"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GroupStudent = { id: string; name: string };

type Group = {
  id: string;
  name: string;
  subject?: string;
  students: GroupStudent[];
  createdAt: string; // UI-only
};

type ModalState =
  | { type: "create" }
  | { type: "edit"; groupId: string }
  | { type: "view"; groupId: string }
  | null;

const mockGroups: Group[] = [
  {
    id: "grp-10a",
    name: "Class 10A",
    subject: "Mathematics",
    students: [
      { id: "s-1", name: "Aarav Sharma" },
      { id: "s-2", name: "Diya Verma" },
      { id: "s-3", name: "Kabir Singh" },
      { id: "s-4", name: "Meera Joshi" },
      { id: "s-5", name: "Reyansh Gupta" },
    ],
    createdAt: "2026-03-15",
  },
  {
    id: "grp-8b",
    name: "Class 8B",
    subject: "Science",
    students: [
      { id: "s-6", name: "Saanvi Rao" },
      { id: "s-7", name: "Vihaan Nair" },
      { id: "s-8", name: "Riya Malhotra" },
    ],
    createdAt: "2026-03-11",
  },
  {
    id: "grp-6a",
    name: "Class 6A",
    subject: "English",
    students: [],
    createdAt: "2026-03-07",
  },
];

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function parseStudents(input: string): string[] {
  return input
    .split(/[,|\n]/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

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
        // Close only when clicking backdrop
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

function EmptyGroupsState({ onCreate }: { onCreate: () => void }) {
  return (
    <section className="flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm">
      <div className="relative h-40 w-40 rounded-full bg-[#f3f3f3]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-20 w-20 rounded-full bg-[#15171b]/5" />
        </div>
      </div>
      <div>
        <p className="text-[18px] font-medium leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
          No groups created yet
        </p>
        <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
          Create a class/group to start assigning AI-generated worksheets.
        </p>
      </div>
      <Button
        className="h-12 gap-2 rounded-full bg-[#15171b] px-8 text-base font-medium text-white shadow-none"
        onClick={onCreate}
      >
        <Plus size={16} />
        Create Group
      </Button>
    </section>
  );
}

function GroupCard({
  group,
  onView,
  onEdit,
  onDelete,
}: {
  group: Group;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-[18px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
            {group.name}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[13px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
            <span className="rounded-full bg-[#f3f3f3] px-3 py-1">{group.students.length} students</span>
            {group.subject ? <span className="rounded-full bg-[#f3f3f3] px-3 py-1">{group.subject}</span> : null}
          </div>
          <p className="mt-2 text-[12px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
            Created {formatDate(group.createdAt)}
          </p>
        </div>
        <div className="hidden shrink-0 md:block">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#15171b]/5">
            <Image src="/images/monkey-logo.png" alt="" width={28} height={28} className="h-7 w-7 object-cover" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f3] px-4 py-2 text-[13px] font-medium text-[rgba(48,48,48,1)] hover:bg-[#eaeaea]"
        >
          <Eye size={14} />
          View
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f3] px-4 py-2 text-[13px] font-medium text-[rgba(48,48,48,1)] hover:bg-[#eaeaea]"
        >
          <Pencil size={14} />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-full bg-[#fef7f7] px-4 py-2 text-[13px] font-medium text-[#ff4a4a] hover:bg-[#fff0f0] border border-[#ffd7d7]"
        >
          <Trash2 size={14} />
          Delete
        </button>
      </div>
    </article>
  );
}

function CreateEditGroupModal({
  mode,
  group,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  group?: Group;
  onClose: () => void;
  onSave: (payload: { name: string; subject?: string; addStudents: string }) => void;
}) {
  const [name, setName] = useState(group?.name ?? "");
  const [subject, setSubject] = useState(group?.subject ?? "");
  const [addStudents, setAddStudents] = useState("");

  const canSave = name.trim().length > 0;

  return (
    <ModalShell title={mode === "create" ? "Create Group" : "Edit Group"} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSave) return;
          onSave({
            name: name.trim(),
            subject: subject.trim() ? subject.trim() : undefined,
            addStudents,
          });
        }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <div className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
              Group Name
            </div>
            <div className="mt-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Class 10A"
                aria-label="Group Name"
              />
            </div>
          </label>

          <label className="block">
            <div className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
              Subject
            </div>
            <div className="mt-2">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Science (optional)"
                aria-label="Subject"
              />
            </div>
          </label>

          <div className="md:col-span-2">
            <label className="block">
              <div className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                Add Students
              </div>
              <div className="mt-2">
                <Input
                  value={addStudents}
                  onChange={(e) => setAddStudents(e.target.value)}
                  placeholder="Type student names separated by commas"
                  aria-label="Add Students"
                />
              </div>
              <p className="mt-2 text-xs leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                Tip: “Aarav Sharma, Diya Verma, Kabir Singh”
              </p>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-stretch justify-between gap-3 md:flex-row md:items-center">
          <Button variant="secondary" className="h-11 rounded-full" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="h-11 rounded-full bg-[#15171b] text-base font-medium text-white shadow-none"
            type="submit"
            disabled={!canSave}
          >
            {mode === "create" ? "Save Group" : "Save Changes"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

function ViewGroupModal({ group, onClose }: { group: Group; onClose: () => void }) {
  return (
    <ModalShell title="Group Details" onClose={onClose}>
      <div className="rounded-3xl bg-[#f5f5f5] p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="truncate text-[20px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              {group.name}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2 text-[13px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
              <span className="rounded-full bg-white px-3 py-1">{group.students.length} students</span>
              {group.subject ? <span className="rounded-full bg-white px-3 py-1">{group.subject}</span> : null}
            </div>
            <p className="mt-2 text-xs leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
              Created {formatDate(group.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-white p-4">
          <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
            Students
          </p>

          {group.students.length === 0 ? (
            <p className="mt-2 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
              No students added yet.
            </p>
          ) : (
            <div className="mt-3 max-h-[220px] overflow-y-auto pr-2">
              <ul className="space-y-2">
                {group.students.map((s) => (
                  <li key={s.id} className="flex items-center justify-between rounded-2xl bg-[#f5f5f5] px-4 py-2">
                    <span className="text-sm font-medium leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
                      {s.name}
                    </span>
                    <span className="text-xs leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
                      Ready
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 rounded-3xl bg-[#15171b]/5 p-4">
            <p className="text-sm font-bold leading-[140%] tracking-[-0.02em] text-[rgba(48,48,48,1)]">
              Future: Link assignments
            </p>
            <p className="mt-1 text-sm leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
              This panel is a placeholder for connecting the group with assignments and student submissions.
            </p>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [modal, setModal] = useState<ModalState>(null);

  const activeGroup = useMemo(() => {
    if (!modal) return null;
    if (modal.type === "create") return null;
    return groups.find((g) => g.id === modal.groupId) ?? null;
  }, [modal, groups]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && modal) setModal(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal]);

  return (
    <section className="h-full min-h-0 overflow-y-auto rounded-2xl bg-[#f5f5f5] p-6 [font-family:var(--font-bricolage)]">
      <div className="mx-auto w-full max-w-[1120px] space-y-6">
        <header className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-[28px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
              My Groups
            </h1>
            <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.02em] text-[rgba(94,94,94,1)]">
              Manage classes and student cohorts for assignments.
            </p>
          </div>

          <Button
            className="h-11 rounded-full bg-[#15171b] px-8 text-base font-medium text-white shadow-none hover:bg-[#22252a]"
            onClick={() => setModal({ type: "create" })}
          >
            <Plus size={16} />
            Create Group
          </Button>
        </header>

        {groups.length === 0 ? (
          <EmptyGroupsState onCreate={() => setModal({ type: "create" })} />
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {groups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                onView={() => setModal({ type: "view", groupId: g.id })}
                onEdit={() => setModal({ type: "edit", groupId: g.id })}
                onDelete={() => {
                  const ok = window.confirm(`Delete "${g.name}"? This cannot be undone.`);
                  if (!ok) return;
                  setGroups((prev) => prev.filter((x) => x.id !== g.id));
                }}
              />
            ))}
          </section>
        )}
      </div>

      {modal?.type === "create" ? (
        <CreateEditGroupModal
          key="create"
          mode="create"
          onClose={() => setModal(null)}
          onSave={({ name, subject, addStudents }) => {
            const studentNames = parseStudents(addStudents);
            const newGroup: Group = {
              id: uid(),
              name,
              subject,
              students: studentNames.map((n) => ({ id: uid(), name: n })),
              createdAt: new Date().toISOString().slice(0, 10),
            };
            setGroups((prev) => [newGroup, ...prev]);
            setModal(null);
          }}
        />
      ) : null}

      {modal?.type === "edit" && activeGroup ? (
        <CreateEditGroupModal
          key={activeGroup.id}
          mode="edit"
          group={activeGroup}
          onClose={() => setModal(null)}
          onSave={({ name, subject, addStudents }) => {
            const studentNames = parseStudents(addStudents);
            setGroups((prev) =>
              prev.map((g) => {
                if (g.id !== activeGroup.id) return g;
                const existing = new Set(g.students.map((s) => s.name.toLowerCase()));
                const incoming = studentNames.filter((n) => !existing.has(n.toLowerCase()));
                return {
                  ...g,
                  name,
                  subject,
                  students: [
                    ...g.students,
                    ...incoming.map((n) => ({
                      id: uid(),
                      name: n,
                    })),
                  ],
                };
              }),
            );
            setModal(null);
          }}
        />
      ) : null}

      {modal?.type === "view" && activeGroup ? <ViewGroupModal group={activeGroup} onClose={() => setModal(null)} /> : null}
    </section>
  );
}

