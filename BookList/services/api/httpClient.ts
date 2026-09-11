import { z } from "zod";
import { API_CONFIG } from "../config";
import { authService } from "../auth/authService";
import {
  AuthError,
  NetworkError,
  ServerError,
  ValidationError,
} from "../../domain/error";
import {
  handleHttpStatusError,
  isAppError,
  mapApiAuthReason,
} from "./httpClientHelpers";

export type RequestOptions<T> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  schema?: z.ZodSchema<T>;
  skipAuth?: boolean;
  skipAutoRefresh?: boolean;
  timeoutMs?: number;
  signal?: AbortSignal;
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class HttpClient {
  async request<T>(
    endpoint: string,
    options: RequestOptions<T> = {},
  ): Promise<T> {
    const {
      method = "GET",
      headers = {},
      body,
      schema,
      skipAuth = false,
      skipAutoRefresh = false,
      timeoutMs = API_CONFIG.defaultTimeoutMs,
      signal,
    } = options;

    const fullUrl = endpoint.startsWith("http")
      ? endpoint
      : `${API_CONFIG.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...headers,
    };

    if (!skipAuth) {
      const token = authService.getAccessToken();
      if (token) {
        requestHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    let attempts = 0;
    const maxAttempts = API_CONFIG.maxRetries503;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        if (signal?.aborted) controller.abort();
        else
          signal?.addEventListener("abort", () => controller.abort(), {
            once: true,
          });

        const response = await fetch(fullUrl, {
          method,
          headers: requestHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          if (response.status === 204) {
            return undefined as T;
          }
          const json = await response.json();
          if (schema) {
            try {
              return schema.parse(json);
            } catch {
              throw {
                type: "VALIDATION",
                fields: { schema: "Response payload structure mismatch." },
                message: "Server response does not match expected schema.",
              } satisfies ValidationError;
            }
          }
          return json as T;
        }

        let errorData: Record<string, unknown> = {};
        try {
          errorData = (await response.json()) as Record<string, unknown>;
        } catch {
          errorData = {};
        }

        const status = response.status;
        const errorMessage =
          typeof errorData.message === "string" ? errorData.message : undefined;

        if (status === 401) {
          const rawError = errorData.erreur;
          if (
            (rawError === "jeton_expire" || rawError === "jeton_absent") &&
            !skipAutoRefresh
          ) {
            try {
              const newToken =
                rawError === "jeton_expire"
                  ? await authService.refreshTokens()
                  : await authService.ensureAuthenticated();
              requestHeaders["Authorization"] = `Bearer ${newToken}`;

              const retryResponse = await fetch(fullUrl, {
                method,
                headers: requestHeaders,
                body: body ? JSON.stringify(body) : undefined,
              });

              if (retryResponse.ok) {
                if (retryResponse.status === 204) return undefined as T;
                const retryJson = await retryResponse.json();
                return schema ? schema.parse(retryJson) : (retryJson as T);
              }
            } catch {
              throw {
                type: "AUTH",
                reason: "reconnect_required",
                message: "Session expired. Please log in again.",
              } satisfies AuthError;
            }
          }

          throw {
            type: "AUTH",
            reason: mapApiAuthReason(rawError),
            message: errorMessage || "Authentication required.",
          } satisfies AuthError;
        }

        if (status === 503 && attempts < maxAttempts) {
          const backoffMs = 300 * Math.pow(2, attempts - 1);
          await sleep(backoffMs);
          continue;
        }

        handleHttpStatusError(status, errorData);
      } catch (err: unknown) {
        if (isAppError(err)) {
          throw err;
        }

        if (signal?.aborted) {
          throw {
            type: "NETWORK",
            message: "Request cancelled.",
            cause: err,
          } satisfies NetworkError;
        }

        if (attempts < maxAttempts) {
          const backoffMs = 300 * Math.pow(2, attempts - 1);
          await sleep(backoffMs);
          continue;
        }

        const msg =
          err instanceof Error ? err.message : "Network connection failure.";
        throw {
          type: "NETWORK",
          message: msg,
          cause: err,
        } satisfies NetworkError;
      }
    }

    throw {
      type: "SERVER",
      httpCode: 503,
      message: "Service unavailable.",
    } satisfies ServerError;
  }
}

export const httpClient = new HttpClient();
