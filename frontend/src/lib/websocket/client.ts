import { io, type Socket } from "socket.io-client";
import { env } from "@/lib/constants/env";

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (socket) {
    return socket;
  }

  socket = io(env.wsUrl, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
  });

  return socket;
}
