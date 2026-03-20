import { env } from "@/lib/constants/env";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function joinUrl(baseUrl: string, path: string) {
  const left = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const right = path.startsWith("/") ? path : `/${path}`;
  return `${left}${right}`;
}

async function parseJsonOrText(res: Response): Promise<unknown> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (!text) return null;

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      // Fall through to raw text below
    }
  }

  // Best-effort: sometimes backend returns JSON without the right content-type.
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = joinUrl(env.apiBaseUrl, path);
  const method = options.method ?? "GET";

  const headers: Record<string, string> = {
    ...(options.headers ?? {}),
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal,
  });

  const data = await parseJsonOrText(res);

  if (!res.ok) {
    let message: string | undefined;

    if (typeof data === "object" && data !== null && "message" in data) {
      const maybeMessage = (data as Record<string, unknown>).message;
      if (typeof maybeMessage === "string") {
        message = maybeMessage;
      }
    }

    throw new ApiError(message ?? res.statusText ?? "Unexpected API error", res.status, data);
  }

  return data as T;
}
