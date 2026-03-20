import { create } from "zustand";
import type { AssignmentJobStatus } from "@/features/assignment/types/assignment.types";

type AssignmentJobState = {
  jobs: Record<string, AssignmentJobStatus>;
  upsertJobStatus: (status: AssignmentJobStatus) => void;
  removeJobStatus: (assignmentId: string) => void;
};

export const useAssignmentJobStore = create<AssignmentJobState>((set) => ({
  jobs: {},
  upsertJobStatus: (status) =>
    set((state) => ({
      jobs: {
        ...state.jobs,
        [status.assignmentId]: status,
      },
    })),
  removeJobStatus: (assignmentId) =>
    set((state) => {
      const nextJobs = { ...state.jobs };
      delete nextJobs[assignmentId];
      return { jobs: nextJobs };
    }),
}));
