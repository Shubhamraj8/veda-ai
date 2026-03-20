import { apiRequest } from "@/lib/api/client";

type ApiSuccess<T> = { success: boolean; data: T };
type ApiListSuccess<T> = { success: boolean; data: T; total?: number; page?: number; limit?: number };

export type BackendAssignmentStatus = "pending" | "processing" | "completed" | "failed";

export type BackendJobStatus = {
  status: string;
  progress: number;
  error?: string;
};

export type BackendGeneratedQuestion = {
  text: string;
  difficulty: "easy" | "medium" | "hard" | "challenging";
  marks: number;
  answerKey: string;
};

export type BackendGeneratedSection = {
  title: string;
  instruction?: string;
  questions: BackendGeneratedQuestion[];
};

export type BackendAssignment = {
  _id: string;
  title: string;
  instructions?: string;
  dueDate?: string;
  questionTypes?: string[];
  totalQuestions?: number;
  totalMarks?: number;
  status: BackendAssignmentStatus | string;
  fileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type BackendCreateAssignmentInput = {
  title: string;
  subject: string;
  instructions?: string;
  totalMarks?: number;
  totalQuestions?: number;
  questionTypes?: Array<"mcq" | "short-answer" | "long-answer" | "true-false">;
  difficulty?: "easy" | "medium" | "hard" | "mixed";
  dueDate?: string; // ISO datetime
};

export type BackendGetAssignmentData = {
  assignment: BackendAssignment;
  jobStatus: BackendJobStatus | null;
  generatedPaper: { sections: BackendGeneratedSection[] } | null;
};

export async function createAssignment(data: BackendCreateAssignmentInput): Promise<BackendAssignment> {
  const res = await apiRequest<ApiSuccess<BackendAssignment>>("/assignments", {
    method: "POST",
    body: data,
  });
  return res.data;
}

export async function getAssignment(assignmentId: string): Promise<BackendGetAssignmentData> {
  const res = await apiRequest<ApiSuccess<BackendGetAssignmentData>>(`/assignments/${encodeURIComponent(assignmentId)}`, {
    method: "GET",
  });
  return res.data;
}

export async function listAssignments(
  page: number = 1,
  limit: number = 10,
): Promise<{ items: BackendAssignment[]; total: number }> {
  const res = await apiRequest<ApiListSuccess<BackendAssignment[]>>(
    `/assignments?page=${encodeURIComponent(String(page))}&limit=${encodeURIComponent(String(limit))}`,
    { method: "GET" },
  );

  return {
    items: res.data,
    total: res.total ?? res.data.length,
  };
}

