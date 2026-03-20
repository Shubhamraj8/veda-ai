import { create } from "zustand";
import type { AssignmentCreatePayload } from "@/features/assignment/types/assignment.types";

type AssignmentFormState = {
  draft: AssignmentCreatePayload;
  updateDraft: (partial: Partial<AssignmentCreatePayload>) => void;
  resetDraft: () => void;
};

const initialDraft: AssignmentCreatePayload = {
  title: "",
  dueDate: "",
  chapterId: "",
  questionTypes: [],
  instructions: "",
};

export const useAssignmentFormStore = create<AssignmentFormState>((set) => ({
  draft: initialDraft,
  updateDraft: (partial) =>
    set((state) => ({
      draft: {
        ...state.draft,
        ...partial,
      },
    })),
  resetDraft: () => set({ draft: initialDraft }),
}));
