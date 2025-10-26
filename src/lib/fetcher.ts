import { createLogger } from "@/lib/logger";

const log = createLogger("fetcher");

export type FetcherInit = RequestInit & { json?: unknown };

export async function fetchJSON<T = unknown>(
  input: RequestInfo | URL,
  init: FetcherInit = {}
): Promise<{ data?: T; error?: { message: string; status?: number } }> {
  const { json, headers, ...rest } = init;
  const url = typeof input === "string" ? input : (input as URL).toString();
  const method = (rest.method || (json ? "POST" : "GET")).toUpperCase();

  try {
    const mergedHeaders: Record<string, string> = {
      ...(headers as Record<string, string>),
    };
    if (json && !mergedHeaders["content-type"]) {
      mergedHeaders["content-type"] = "application/json";
    }

    const res = await fetch(input, {
      ...rest,
      method,
      headers: mergedHeaders,
      body: json ? JSON.stringify(json) : rest.body,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJSON = contentType.includes("application/json");
    const body = isJSON
      ? await res.json().catch(() => undefined)
      : await res.text().catch(() => undefined);

    if (!res.ok) {
      log.warn("HTTP error", { url, method, status: res.status, body });
      let message = res.statusText;
      if (
        isJSON &&
        body &&
        typeof body === "object" &&
        "message" in (body as Record<string, unknown>)
      ) {
        const maybe = body as { message?: string };
        if (maybe.message) message = maybe.message;
      } else if (!isJSON && typeof body === "string" && body) {
        message = body;
      }
      return { error: { message, status: res.status } };
    }
    log.debug("HTTP success", { url, method, status: res.status });
    return { data: body as T };
  } catch (e) {
    const message = (e as Error)?.message || "Network error";
    log.error("HTTP exception", { url, method, message });
    return { error: { message } };
  }
}
