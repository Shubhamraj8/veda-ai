import { create } from "zustand";
import type { AssignmentCreatePayload } from "@/features/assignment/types/assignment.types";

export type AssignmentFlowStep = "idle" | "creating" | "uploading" | "processing" | "completed" | "error";

type FileMeta = {
  name: string;
  size: number;
  type: string;
};

type AssignmentFlowState = {
  step: AssignmentFlowStep;
  errorMessage: string | null;
  file: FileMeta | null;
  progress: number;
  // Keep a copy of the payload used to generate so result screen can render deterministically.
  payload: Partial<AssignmentCreatePayload> | null;
  setStep: (step: AssignmentFlowStep) => void;
  setErrorMessage: (message: string | null) => void;
  setFile: (file: FileMeta | null) => void;
  setProgress: (progress: number) => void;
  setPayload: (payload: Partial<AssignmentCreatePayload> | null) => void;
  reset: () => void;
};

export const useAssignmentFlowStore = create<AssignmentFlowState>((set) => ({
  step: "idle",
  errorMessage: null,
  file: null,
  progress: 0,
  payload: null,
  setStep: (step) => set({ step }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  setFile: (file) => set({ file }),
  setProgress: (progress) => set({ progress }),
  setPayload: (payload) => set({ payload }),
  reset: () =>
    set({
      step: "idle",
      errorMessage: null,
      file: null,
      progress: 0,
      payload: null,
    }),
}));

