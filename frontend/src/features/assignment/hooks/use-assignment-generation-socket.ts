"use client";

import { useEffect } from "react";
import { useAssignmentJobStore } from "@/features/assignment/store/assignment-job.store";
import { getSocketClient } from "@/lib/websocket/client";

interface GenerationPayload {
  assignmentId: string;
  progress?: number;
  message?: string;
}

export function useAssignmentGenerationSocket() {
  const upsertJobStatus = useAssignmentJobStore((state) => state.upsertJobStatus);

  useEffect(() => {
    const socket = getSocketClient();

    if (!socket.connected) {
      socket.connect();
    }

    const onStarted = (payload: GenerationPayload) => {
      upsertJobStatus({ assignmentId: payload.assignmentId, status: "generating", progress: 0, message: payload.message ?? "Generation started" });
    };

    const onProgress = (payload: GenerationPayload) => {
      upsertJobStatus({ assignmentId: payload.assignmentId, status: "generating", progress: payload.progress ?? 0, message: payload.message });
    };

    const onCompleted = (payload: GenerationPayload) => {
      upsertJobStatus({ assignmentId: payload.assignmentId, status: "completed", progress: 100, message: payload.message ?? "Generation completed" });
    };

    const onFailed = (payload: GenerationPayload) => {
      upsertJobStatus({ assignmentId: payload.assignmentId, status: "failed", progress: payload.progress ?? 0, message: payload.message ?? "Generation failed" });
    };

    socket.on("generation_started", onStarted);
    socket.on("generation_progress", onProgress);
    socket.on("generation_completed", onCompleted);
    socket.on("generation_failed", onFailed);

    return () => {
      socket.off("generation_started", onStarted);
      socket.off("generation_progress", onProgress);
      socket.off("generation_completed", onCompleted);
      socket.off("generation_failed", onFailed);
    };
  }, [upsertJobStatus]);
}
