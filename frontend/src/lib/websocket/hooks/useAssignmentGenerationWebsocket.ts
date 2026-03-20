"use client";

import { useEffect, useRef } from "react";
import type { Socket } from "socket.io-client";
import { getSocketClient } from "@/lib/websocket/client";

type GenerationStartedPayload = {
  assignmentId: string;
  status?: string;
  message?: string;
};

type GenerationProgressPayload = {
  assignmentId: string;
  progress?: number;
  status?: string;
  message?: string;
};

type GenerationCompletedPayload = {
  assignmentId: string;
  status?: string;
};

type GenerationFailedPayload = {
  assignmentId: string;
  status?: string;
  error?: string;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getAssignmentId(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const id = payload.assignmentId;
  return typeof id === "string" ? id : null;
}

export function useAssignmentGenerationWebsocket({
  assignmentId,
  enabled,
  onStarted,
  onProgress,
  onCompleted,
  onFailed,
}: {
  assignmentId: string | null;
  enabled: boolean;
  onStarted?: (payload: GenerationStartedPayload) => void;
  onProgress?: (payload: GenerationProgressPayload) => void;
  onCompleted?: (payload: GenerationCompletedPayload) => void;
  onFailed?: (payload: GenerationFailedPayload) => void;
}) {
  const callbacksRef = useRef({
    onStarted,
    onProgress,
    onCompleted,
    onFailed,
  });

  useEffect(() => {
    callbacksRef.current = { onStarted, onProgress, onCompleted, onFailed };
  }, [onCompleted, onFailed, onProgress, onStarted]);

  useEffect(() => {
    if (!enabled) return;
    if (!assignmentId) return;

    const socket = getSocketClient() as Socket;
    let didFail = false;
    let disconnectTimeoutId: number | null = null;

    // If we can't connect at all (backend down / wrong URL), fail fast.
    const connectTimeoutMs = 10_000;
    const connectTimeoutId = window.setTimeout(() => {
      if (didFail) return;
      if (socket.connected) return;
      didFail = true;
      callbacksRef.current.onFailed?.({
        assignmentId,
        status: "failed",
        error: "WebSocket connection timeout",
        message: "Can't reach the generation service. Please check backend URL and retry.",
      });
    }, connectTimeoutMs);

    const clearConnectTimer = () => window.clearTimeout(connectTimeoutId);
    const clearDisconnectTimer = () => {
      if (disconnectTimeoutId !== null) {
        window.clearTimeout(disconnectTimeoutId);
        disconnectTimeoutId = null;
      }
    };

    const joinRoom = () => {
      socket.emit("join:assignment", assignmentId);
    };

    const handleConnect = () => {
      clearDisconnectTimer();
      clearConnectTimer();
      joinRoom();
    };

    const handleDisconnect = (reason: string) => {
      clearDisconnectTimer();

      // Avoid flickering error state on short disconnects.
      // If we don't reconnect within the timeout, fail the flow.
      disconnectTimeoutId = window.setTimeout(() => {
        if (didFail) return;
        if (!enabled) return;
        if (socket.connected) return;

        didFail = true;
        callbacksRef.current.onFailed?.({
          assignmentId,
          status: "failed",
          error: `WebSocket disconnected${reason ? ` (${reason})` : ""}`,
          message: "Connection lost. Please retry.",
        });
      }, 12000);
    };

    const handleStarted = (payload: unknown) => {
      if (getAssignmentId(payload) !== assignmentId) return;
      if (!isRecord(payload)) return;
      const safe: GenerationStartedPayload = {
        assignmentId,
        status: typeof payload.status === "string" ? payload.status : undefined,
        message: typeof payload.message === "string" ? payload.message : undefined,
      };
      callbacksRef.current.onStarted?.(safe);
    };

    const handleProgress = (payload: unknown) => {
      if (getAssignmentId(payload) !== assignmentId) return;
      if (!isRecord(payload)) return;
      const progress = typeof payload.progress === "number" ? payload.progress : undefined;
      const safe: GenerationProgressPayload = {
        assignmentId,
        status: typeof payload.status === "string" ? payload.status : undefined,
        progress,
        message: typeof payload.message === "string" ? payload.message : undefined,
      };
      callbacksRef.current.onProgress?.(safe);
    };

    const handleCompleted = (payload: unknown) => {
      if (getAssignmentId(payload) !== assignmentId) return;
      if (!isRecord(payload)) return;
      const safe: GenerationCompletedPayload = {
        assignmentId,
        status: typeof payload.status === "string" ? payload.status : undefined,
      };
      callbacksRef.current.onCompleted?.(safe);
    };

    const handleFailed = (payload: unknown) => {
      if (getAssignmentId(payload) !== assignmentId) return;
      if (!isRecord(payload)) return;
      didFail = true;
      const safe: GenerationFailedPayload = {
        assignmentId,
        status: typeof payload.status === "string" ? payload.status : undefined,
        error: typeof payload.error === "string" ? payload.error : undefined,
        message: typeof payload.message === "string" ? payload.message : undefined,
      };
      callbacksRef.current.onFailed?.(safe);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("generation_started", handleStarted);
    socket.on("generation_progress", handleProgress);
    socket.on("generation_completed", handleCompleted);
    socket.on("generation_failed", handleFailed);

    if (socket.connected) {
      joinRoom();
    } else {
      socket.connect();
    }

    return () => {
      didFail = true;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("generation_started", handleStarted);
      socket.off("generation_progress", handleProgress);
      socket.off("generation_completed", handleCompleted);
      socket.off("generation_failed", handleFailed);
      clearDisconnectTimer();
      clearConnectTimer();
      socket.emit("leave:assignment", assignmentId);
    };
  }, [assignmentId, enabled]);
}

