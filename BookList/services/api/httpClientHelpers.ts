import {
  AppError,
  AuthError,
  AuthReason,
  ConflictError,
  ServerError,
  ValidationError,
} from "../../domain/error";

export function mapApiAuthReason(serverReason?: unknown): AuthReason {
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

export function isAppError(err: unknown): err is AppError {
  if (typeof err !== "object" || err === null) return false;
  const type = (err as { type?: string }).type;
  return (
    typeof type === "string" &&
    ["AUTH", "VALIDATION", "CONFLICT", "SERVER", "NETWORK"].includes(type)
  );
}

export function handleHttpStatusError(
  status: number,
  errorData: Record<string, unknown>,
): void {
  const errorMessage =
    typeof errorData.message === "string" ? errorData.message : undefined;

  if (status === 403) {
    throw {
      type: "AUTH",
      reason: "insufficient_permissions",
      message: errorMessage || "Insufficient permissions for this action.",
    } satisfies AuthError;
  }

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

  throw {
    type: "SERVER",
    httpCode: status,
    message: errorMessage || `Server error (${status}).`,
  } satisfies ServerError;
}
