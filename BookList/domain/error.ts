export type NetworkError = {
  type: 'NETWORK';
  message: string;
  cause?: unknown;
};

export type AuthReason =
  | 'token_missing'
  | 'token_expired'
  | 'token_invalid'
  | 'insufficient_permissions'
  | 'reconnect_required';

export type AuthError = {
  type: 'AUTH';
  reason: AuthReason;
  message: string;
};

export type ValidationError = {
  type: 'VALIDATION';
  fields: Record<string, string>;
  message: string;
};

export type ConflictError = {
  type: 'CONFLICT';
  message: string;
  serverState?: unknown;
  expectedVersion?: number;
};

export type ServerError = {
  type: 'SERVER';
  httpCode: number;
  message: string;
};

export type AppError =
  | NetworkError
  | AuthError
  | ValidationError
  | ConflictError
  | ServerError;

export function isAppError(err: unknown): err is AppError {
  if (typeof err !== 'object' || err === null) return false;
  const type = (err as { type?: string }).type;
  return (
    typeof type === 'string' &&
    ['NETWORK', 'AUTH', 'VALIDATION', 'CONFLICT', 'SERVER'].includes(type)
  );
}
