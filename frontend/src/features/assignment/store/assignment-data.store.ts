import { create } from "zustand";
import type { Assignment, AssignmentCreatePayload } from "@/features/assignment/types/assignment.types";
import { useAssignmentFlowStore } from "@/features/assignment/store/assignment-flow.store";
import {
  createAssignment as apiCreateAssignment,
  getAssignment as apiGetAssignment,
  listAssignments as apiListAssignments,
  type BackendAssignment,
  type BackendCreateAssignmentInput,
  type BackendGeneratedSection,
  type BackendJobStatus,
} from "@/lib/api/assignments";

type AssignmentDataPhase = "idle" | "processing" | "completed" | "error";

type AssignmentDataState = {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  currentAssignmentId: string | null;

  // Generated paper content (structured).
  generatedSections: BackendGeneratedSection[] | null;

  // Phase driven by backend status.
  phase: AssignmentDataPhase;

  loading: boolean;
  error: string | null;

  // Derived from backend job tracking (if available).
  currentProgress: number | null;
  currentJobStatus: BackendJobStatus | null;

  // In-memory cache for assignments list (UI-only).
  assignmentsCache: Record<string, { items: Assignment[]; fetchedAt: number }>;
  assignmentsCacheTtlMs: number;

  setPhase: (phase: AssignmentDataPhase) => void;
  setProcessingProgress: (progress: number) => void;
  setCompletedPhase: () => void;
  setFailed: (message: string) => void;

  createAssignment: () => Promise<void>;
  retryCreateAssignment: () => Promise<void>;
  fetchAssignment: () => Promise<void>;
  fetchAssignments: (page?: number, limit?: number) => Promise<void>;
  reset: () => void;
};

function mapBackendStatus(status: BackendAssignment["status"]): Assignment["status"] {
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "processing") return "processing";
  if (status === "pending") return "pending";
  // Fallback: keep the raw status if it matches the union.
  return status as Assignment["status"];
}

function toUiAssignment(a: BackendAssignment): Assignment {
  const createdAt = a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN") : undefined;

  return {
    id: a._id,
    title: a.title,
    assignedOn: createdAt,
    dueDate: a.dueDate,
    status: mapBackendStatus(a.status),
    fileUrl: a.fileUrl,
  };
}

type BackendQuestionType = "mcq" | "short-answer" | "long-answer" | "true-false";

function labelToBackendQuestionType(label: string): BackendQuestionType | null {
  const v = label.toLowerCase();

  if (v.includes("multiple choice")) return "mcq";
  if (v.includes("short")) return "short-answer";
  if (v.includes("diagram") || v.includes("graph")) return "long-answer";
  if (v.includes("numerical") || v.includes("problem")) return "long-answer";

  // If it doesn't match known options, omit it.
  return null;
}

function mapPayloadToBackendInput(payload: Partial<AssignmentCreatePayload>): BackendCreateAssignmentInput {
  const title = (payload.title ?? "").trim();
  const subject = (payload.chapterId ?? "").trim();

  if (!title) throw new Error("Missing assignment title.");
  if (!subject) throw new Error("Missing chapter/subject.");

  const instructions = payload.instructions?.trim() ? payload.instructions.trim() : undefined;

  const questionTypeRows = payload.questionTypes ?? [];
  const totalQuestions = questionTypeRows.reduce((sum, qt) => sum + qt.count, 0);
  const totalMarks = questionTypeRows.reduce((sum, qt) => sum + qt.count * qt.marks, 0);

  const questionTypeSet = new Set<BackendQuestionType>();
  for (const qt of questionTypeRows) {
    const mapped = labelToBackendQuestionType(qt.type);
    if (mapped) questionTypeSet.add(mapped);
  }

  // Backend expects an ISO datetime string; Create Assignment uses YYYY-MM-DD from <input type="date" />
  let dueDateIso: string | undefined;
  if (payload.dueDate) {
    // Avoid timezone shifting by treating the date as UTC midnight.
    const dt = new Date(`${payload.dueDate}T00:00:00.000Z`);
    if (!Number.isNaN(dt.getTime())) dueDateIso = dt.toISOString();
  }

  return {
    title,
    subject,
    instructions,
    totalQuestions: totalQuestions > 0 ? totalQuestions : undefined,
    totalMarks: totalMarks > 0 ? totalMarks : undefined,
    questionTypes: questionTypeSet.size > 0 ? Array.from(questionTypeSet) : undefined,
    dueDate: dueDateIso,
  };
}

export const useAssignmentDataStore = create<AssignmentDataState>((set) => ({
  assignments: [],
  currentAssignment: null,
  currentAssignmentId: null,
  generatedSections: null,
  phase: "idle",
  loading: false,
  error: null,
  currentProgress: null,
  currentJobStatus: null,
  assignmentsCache: {},
  assignmentsCacheTtlMs: 60_000,

  setPhase: (phase) => set({ phase }),
  setProcessingProgress: (progress) =>
    set({
      phase: "processing",
      currentProgress: progress,
      error: null,
      loading: false,
    }),
  setCompletedPhase: () =>
    set({
      phase: "completed",
      currentProgress: 100,
      error: null,
      loading: false,
    }),
  setFailed: (message) =>
    set({
      phase: "error",
      error: message,
      currentProgress: null,
      loading: false,
    }),

  createAssignment: async () => {
    const flow = useAssignmentFlowStore.getState();
    const payload = flow.payload;

    if (!payload) {
      set({ phase: "error", error: "Missing assignment payload.", loading: false });
      return;
    }

    // Optimistic UX: immediately enter processing phase (UI can start animating).
    // Real assignment id is stored after the POST returns.
    set({
      loading: true,
      error: null,
      phase: "processing",
      currentProgress: 0,
      generatedSections: null,
      // Optional optimistic placeholder so UI can show the title instantly.
      currentAssignment: payload?.title?.trim()
        ? {
            id: `temp-${Date.now()}`,
            title: payload.title.trim(),
            assignedOn: undefined,
            dueDate: payload.dueDate,
            status: "processing",
            fileUrl: undefined,
          }
        : null,
    });

    try {
      const backendInput = mapPayloadToBackendInput(payload);
      const created = await apiCreateAssignment(backendInput);
      const current = toUiAssignment(created);

      set({
        currentAssignmentId: current.id,
        currentAssignment: current,
        generatedSections: null,
        phase: "processing",
        loading: false,
        error: null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create assignment.";
      set({ phase: "error", error: message, loading: false });
      throw e;
    }
  },

  retryCreateAssignment: async () => {
    // Retry mechanism: re-create the assignment generation job using the
    // last submitted payload from the flow store.
    const flow = useAssignmentFlowStore.getState();
    if (!flow.payload) {
      set({ phase: "error", error: "Missing assignment payload.", loading: false });
      return;
    }

    // Ensure payload is still valid before retrying (avoid looping on invalid requests).
    try {
      mapPayloadToBackendInput(flow.payload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid assignment payload.";
      set({ phase: "error", error: msg, loading: false, currentProgress: null });
      return;
    }

    // Clear any previous completion/error artifacts; UI will re-enter processing.
    set({
      generatedSections: null,
      error: null,
      phase: "processing",
      currentProgress: 0,
    });

    // Reuse createAssignment implementation (optimistic placeholder + POST).
    await useAssignmentDataStore.getState().createAssignment();
  },

  fetchAssignment: async () => {
    const { currentAssignmentId } = useAssignmentDataStore.getState();
    if (!currentAssignmentId) {
      set({ error: "No current assignment id to fetch.", phase: "error" });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await apiGetAssignment(currentAssignmentId);

      const assignment = toUiAssignment(res.assignment);
      const jobStatus = res.jobStatus;
      const generatedSections = res.generatedPaper?.sections ?? null;

      const nextPhase: AssignmentDataPhase =
        assignment.status === "completed"
          ? "completed"
          : assignment.status === "failed"
            ? "error"
            : "processing";

      set({
        currentAssignmentId: assignment.id,
        currentAssignment: assignment,
        currentJobStatus: jobStatus,
        generatedSections,
        currentProgress: typeof jobStatus?.progress === "number" ? jobStatus.progress : null,
        phase: nextPhase,
        loading: false,
        error: null,
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch assignment.";
      set({ error: message, loading: false, phase: "error" });
      throw e;
    }
  },

  fetchAssignments: async (page: number = 1, limit: number = 10) => {
    const key = `${page}:${limit}`;
    const now = Date.now();
    const cached = useAssignmentDataStore.getState().assignmentsCache[key];
    if (cached && now - cached.fetchedAt < useAssignmentDataStore.getState().assignmentsCacheTtlMs) {
      set({
        assignments: cached.items,
        loading: false,
        error: null,
      });
      return;
    }

    set({ loading: true, error: null });

    try {
      const res = await apiListAssignments(page, limit);
      const items = res.items.map(toUiAssignment);
      set({
        assignments: items,
        loading: false,
        error: null,
        assignmentsCache: {
          ...useAssignmentDataStore.getState().assignmentsCache,
          [key]: { items, fetchedAt: Date.now() },
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to fetch assignments.";
      set({ error: message, loading: false });
      throw e;
    }
  },

  reset: () =>
    set({
      assignments: [],
      currentAssignment: null,
      currentAssignmentId: null,
      generatedSections: null,
      phase: "idle",
      loading: false,
      error: null,
      currentProgress: null,
      currentJobStatus: null,
    }),
}));

