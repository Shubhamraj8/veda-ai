"use client";

import { useMemo, useState } from "react";
import { Download, Eye, RefreshCcw, Search } from "lucide-react";

type ResourceType = "assignment" | "question-paper" | "uploaded-file";

type LibraryItem = {
  id: string;
  title: string;
  type: ResourceType;
  createdAt: string;
};

type FilterKey = "all" | "assignment" | "question-paper" | "uploaded-file";

const filterTabs: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "All" },
  { key: "assignment", label: "Assignments" },
  { key: "question-paper", label: "Question Papers" },
  { key: "uploaded-file", label: "Uploaded Files" },
];

const mockLibraryItems: LibraryItem[] = [
  {
    id: "lib-001",
    title: "Class 8 - Electricity Assignment",
    type: "assignment",
    createdAt: "2026-03-17",
  },
  {
    id: "lib-002",
    title: "CBSE Grade 8 Science Question Paper",
    type: "question-paper",
    createdAt: "2026-03-16",
  },
  {
    id: "lib-003",
    title: "Class 7 Math Quiz - Fractions",
    type: "assignment",
    createdAt: "2026-03-14",
  },
  {
    id: "lib-004",
    title: "Photosynthesis Notes Reference.pdf",
    type: "uploaded-file",
    createdAt: "2026-03-12",
  },
  {
    id: "lib-005",
    title: "English Grammar Practice Paper",
    type: "question-paper",
    createdAt: "2026-03-09",
  },
  {
    id: "lib-006",
    title: "Class 6 Social Science Source Material.pdf",
    type: "uploaded-file",
    createdAt: "2026-03-08",
  },
];

function formatType(type: ResourceType): string {
  if (type === "question-paper") return "Question Paper";
  if (type === "uploaded-file") return "Uploaded File";
  return "Assignment";
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LibraryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const items = useMemo(() => {
    return mockLibraryItems.filter((item) => {
      const filterMatch = activeFilter === "all" ? true : item.type === activeFilter;
      const searchMatch = item.title.toLowerCase().includes(search.toLowerCase().trim());
      return filterMatch && searchMatch;
    });
  }, [activeFilter, search]);

  return (
    <section className="h-full min-h-0 overflow-y-auto rounded-2xl bg-[#f5f5f5] p-6 [font-family:var(--font-bricolage)]">
      <div className="mx-auto w-full max-w-[1120px] space-y-6">
        <header className="rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-[28px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
            My Library
          </h1>
          <p className="mt-1 text-[14px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
            Manage your resources, previously generated assignments, and reference files.
          </p>
        </header>

        <section className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`rounded-full px-4 py-2 text-[14px] font-medium leading-[140%] tracking-[-0.04em] transition ${
                    activeFilter === tab.key
                      ? "bg-[#15171b] text-white"
                      : "bg-[#f3f3f3] text-[rgba(94,94,94,1)] hover:bg-[#eaeaea]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-[340px]">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(148,148,148,1)]"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title"
                className="h-11 w-full rounded-full border border-[#e7e7e7] bg-white pl-11 pr-4 text-[14px] text-[rgba(48,48,48,1)] outline-none placeholder:text-[rgba(148,148,148,1)]"
              />
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="flex min-h-[320px] items-center justify-center rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-[18px] font-medium leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
              No resources yet
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <h2 className="text-[18px] font-bold leading-[140%] tracking-[-0.04em] text-[rgba(48,48,48,1)]">
                  {item.title}
                </h2>
                <div className="mt-2 flex items-center gap-3 text-[13px] leading-[140%] tracking-[-0.04em] text-[rgba(94,94,94,1)]">
                  <span className="rounded-full bg-[#f3f3f3] px-3 py-1">{formatType(item.type)}</span>
                  <span>Created {formatDate(item.createdAt)}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f3] px-4 py-2 text-[13px] font-medium text-[rgba(48,48,48,1)] hover:bg-[#eaeaea]"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#f3f3f3] px-4 py-2 text-[13px] font-medium text-[rgba(48,48,48,1)] hover:bg-[#eaeaea]"
                  >
                    <Download size={14} />
                    Download
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-[#15171b] px-4 py-2 text-[13px] font-medium text-white hover:bg-[#23262c]"
                  >
                    <RefreshCcw size={14} />
                    Reuse
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </section>
  );
}

