import { z } from "zod";
import { API_CONFIG } from "../config";
import { authService } from "../auth/authService";
import {
  AppError,
  AuthError,
  AuthReason,
  ConflictError,
  NetworkError,
  ServerError,
  ValidationError,
} from "../../domain/error";

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

function mapApiAuthReason(serverReason?: unknown): AuthReason {
  if (typeof serverReason !== "string") return "token_invalid";
  switch (serverReason) {
    case "jeton_absent":
      return "token_missing";
    case "jeton_expire":
      return "token_expired";
    case "jeton_invalide":
      return "token_invalid";
    case "droits_insuffisants":
      return "insufficient_permissions";
    default:
      return "token_invalid";
  }
}

function isAppError(err: unknown): err is AppError {
  if (typeof err !== "object" || err === null) return false;
  const type = (err as { type?: string }).type;
  return (
    typeof type === "string" &&
    ["AUTH", "VALIDATION", "CONFLICT", "SERVER", "NETWORK"].includes(type)
  );
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
        // Relie l'annulation externe (recherche remplacee) au controleur interne.
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

        // Handle successful response (200-299)
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

        // Handle error status responses
        let errorData: Record<string, unknown> = {};
        try {
          errorData = (await response.json()) as Record<string, unknown>;
        } catch {
          errorData = {};
        }

        const status = response.status;
        const errorMessage =
          typeof errorData.message === "string" ? errorData.message : undefined;

        // 401 Unauthorized
        if (status === 401) {
          const rawError = errorData.erreur;

          // Attempt transparent token refresh or re-authentication
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

              // Retry original request with new token
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

        // 403 Forbidden
        if (status === 403) {
          throw {
            type: "AUTH",
            reason: "insufficient_permissions",
            message:
              errorMessage || "Insufficient permissions for this action.",
          } satisfies AuthError;
        }

        // 409 Conflict (ETag / version mismatch)
        if (status === 409) {
          throw {
            type: "CONFLICT",
            message: errorMessage || "Version conflict detected.",
            serverState: errorData.serveur,
            expectedVersion:
              typeof errorData.versionAttendue === "number"
                ? errorData.versionAttendue
                : undefined,
          } satisfies ConflictError;
        }

        // 422 Validation Error
        if (status === 422) {
          const fields =
            typeof errorData.champs === "object" && errorData.champs !== null
              ? (errorData.champs as Record<string, string>)
              : {};
          throw {
            type: "VALIDATION",
            fields,
            message: errorMessage || "Field validation error.",
          } satisfies ValidationError;
        }

        // 503 Service Unavailable / Chaos Mode -> Retryable
        if (status === 503) {
          if (attempts < maxAttempts) {
            const backoffMs = 300 * Math.pow(2, attempts - 1);
            await sleep(backoffMs);
            continue; // Retry loop
          }
          throw {
            type: "SERVER",
            httpCode: 503,
            message: "Service temporarily unavailable.",
          } satisfies ServerError;
        }

        // General Server Error
        throw {
          type: "SERVER",
          httpCode: status,
          message: errorMessage || `Server error (${status}).`,
        } satisfies ServerError;
      } catch (err: unknown) {
        // Re-throw typed domain errors
        if (isAppError(err)) {
          throw err;
        }

        // Annulation volontaire : ne pas reessayer.
        if (signal?.aborted) {
          throw {
            type: "NETWORK",
            message: "Request cancelled.",
            cause: err,
          } satisfies NetworkError;
        }

        // Retry on network failures if attempts remain
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
