export const env = {
  // Prefer NEXT_PUBLIC_API_URL. Keep NEXT_PUBLIC_API_BASE_URL as fallback for older configs.
  // Note: defaults keep Next.js build/dev working even if env isn't provided.
  apiBaseUrl:
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    // Backend defaults to PORT=5000 in this repo.
    "http://localhost:5000/api/v1",
  // Note: Socket.IO is optional for now; this default keeps the app resilient.
  wsUrl: process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:5000",
} as const;
