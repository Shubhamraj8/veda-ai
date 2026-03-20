// Includes both UI-simulated statuses and backend-driven statuses.
export type AssignmentStatus =
  | "draft"
  | "queued"
  | "generating"
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export interface Assignment {
  id: string;
  title: string;
  assignedOn?: string;
  dueDate?: string;
  status: AssignmentStatus;
  fileUrl?: string;
}

export interface AssignmentCreatePayload {
  title: string;
  dueDate: string;
  chapterId: string;
  questionTypes: Array<{
    type: string;
    count: number;
    marks: number;
  }>;
  instructions?: string;
}

export interface AssignmentJobStatus {
  assignmentId: string;
  progress: number;
  status: AssignmentStatus;
  message?: string;
}
