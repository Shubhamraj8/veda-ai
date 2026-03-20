"use client";

import { create } from "zustand";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
  createdAt: number;
  timeoutMs: number;
};

type ToastState = {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id" | "createdAt">) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
};

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: ({ type, message, timeoutMs }) => {
    const id = uid();
    const toast: Toast = { id, type, message, timeoutMs, createdAt: Date.now() };
    set((s) => ({ toasts: [toast, ...s.toasts].slice(0, 4) }));

    window.setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, toast.timeoutMs);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clearToasts: () => set({ toasts: [] }),
}));

