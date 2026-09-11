/**
 * Network failure or unreachable backend server.
 */
export type NetworkError = {
  type: "NETWORK";
  message: string;
  cause?: unknown;
};

/**
 * Granular reasons for authentication or permission failures.
 */
export type AuthReason =
  | "token_missing"
  | "token_expired"
  | "token_invalid"
  | "insufficient_permissions"
  | "reconnect_required";

/**
 * Authentication or authorization failure.
 */
export type AuthError = {
  type: "AUTH";
  reason: AuthReason;
  message: string;
};

/**
 * Server-side validation error mapping invalid fields to human-readable error messages.
 */
export type ValidationError = {
  type: "VALIDATION";
  fields: Record<string, string>;
  message: string;
};

/**
 * Optimistic concurrency version conflict during update operations.
 */
export type ConflictError = {
  type: "CONFLICT";
  message: string;
  serverState?: unknown;
  expectedVersion?: number;
};

/**
 * Unexpected HTTP 5xx server exception.
 */
export type ServerError = {
  type: "SERVER";
  httpCode: number;
  message: string;
};

/**
 * Discriminated union of all application domain errors.
 */
export type AppError =
  NetworkError | AuthError | ValidationError | ConflictError | ServerError;

/**
 * Discriminator constants for domain errors.
 */
export const APP_ERROR_TYPES = [
  "NETWORK",
  "AUTH",
  "VALIDATION",
  "CONFLICT",
  "SERVER",
] as const;

export type AppErrorType = (typeof APP_ERROR_TYPES)[number];

const APP_ERROR_TYPE_SET = new Set<string>(APP_ERROR_TYPES);

/**
 * Type guard verifying whether an unknown value conforms to the AppError contract.
 */
export function isAppError(err: unknown): err is AppError {
  if (typeof err !== "object" || err === null) return false;
  const type = (err as { type?: unknown }).type;
  return typeof type === "string" && APP_ERROR_TYPE_SET.has(type);
}
