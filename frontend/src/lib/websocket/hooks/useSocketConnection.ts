"use client";

import { useEffect } from "react";
import { getSocketClient } from "@/lib/websocket/client";

export function useSocketConnection(enabled = true) {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const socket = getSocketClient();

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.disconnect();
    };
  }, [enabled]);
}
