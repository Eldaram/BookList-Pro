import { z } from 'zod';
import { API_CONFIG } from '../config';
import { authService } from '../auth/authService';
import {
  AppError,
  AuthError,
  AuthReason,
  ConflictError,
  NetworkError,
  ServerError,
  ValidationError,
} from '../../domain/error';

export type RequestOptions<T> = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  schema?: z.ZodSchema<T>;
  skipAuth?: boolean;
  skipAutoRefresh?: boolean;
  timeoutMs?: number;
};

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapApiAuthReason(serverReason?: string): AuthReason {
  switch (serverReason) {
    case 'jeton_absent':
      return 'token_missing';
    case 'jeton_expire':
      return 'token_expired';
    case 'jeton_invalide':
      return 'token_invalid';
    case 'droits_insuffisants':
      return 'insufficient_permissions';
    default:
      return 'token_invalid';
  }
}

class HttpClient {
  async request<T>(endpoint: string, options: RequestOptions<T> = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      schema,
      skipAuth = false,
      skipAutoRefresh = false,
      timeoutMs = API_CONFIG.defaultTimeoutMs,
    } = options;

    const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_CONFIG.baseUrl}${endpoint}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (!skipAuth) {
      const token = authService.getAccessToken();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    let attempts = 0;
    const maxAttempts = API_CONFIG.maxRetries503;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
            } catch (err: any) {
              throw {
                type: 'VALIDATION',
                fields: { schema: 'Response payload structure mismatch.' },
                message: 'Server response does not match expected schema.',
              } satisfies ValidationError;
            }
          }
          return json as T;
        }

        // Handle error status responses
        let errorData: any = {};
        try {
          errorData = await response.json();
        } catch {
          errorData = {};
        }

        const status = response.status;

        // 401 Unauthorized
        if (status === 401) {
          const rawError = errorData.erreur || 'jeton_invalide';

          // Attempt transparent token refresh on token expiration
          if (rawError === 'jeton_expire' && !skipAutoRefresh) {
            try {
              const newToken = await authService.refreshTokens();
              requestHeaders['Authorization'] = `Bearer ${newToken}`;

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
                type: 'AUTH',
                reason: 'reconnect_required',
                message: 'Session expired. Please log in again.',
              } satisfies AuthError;
            }
          }

          throw {
            type: 'AUTH',
            reason: mapApiAuthReason(rawError),
            message: errorData.message || 'Authentication required.',
          } satisfies AuthError;
        }

        // 403 Forbidden
        if (status === 403) {
          throw {
            type: 'AUTH',
            reason: 'insufficient_permissions',
            message: errorData.message || 'Insufficient permissions for this action.',
          } satisfies AuthError;
        }

        // 409 Conflict (ETag / version mismatch)
        if (status === 409) {
          throw {
            type: 'CONFLICT',
            message: errorData.message || 'Version conflict detected.',
            serverState: errorData.serveur,
            expectedVersion: errorData.versionAttendue,
          } satisfies ConflictError;
        }

        // 422 Validation Error
        if (status === 422) {
          throw {
            type: 'VALIDATION',
            fields: errorData.champs || {},
            message: errorData.message || 'Field validation error.',
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
            type: 'SERVER',
            httpCode: 503,
            message: 'Service temporarily unavailable.',
          } satisfies ServerError;
        }

        // General Server Error
        throw {
          type: 'SERVER',
          httpCode: status,
          message: errorData.message || `Server error (${status}).`,
        } satisfies ServerError;

      } catch (err: any) {
        // Re-throw typed domain errors
        if (err.type && ['AUTH', 'VALIDATION', 'CONFLICT', 'SERVER', 'NETWORK'].includes(err.type)) {
          throw err satisfies AppError;
        }

        // Retry on network failures if attempts remain
        if (attempts < maxAttempts) {
          const backoffMs = 300 * Math.pow(2, attempts - 1);
          await sleep(backoffMs);
          continue;
        }

        throw {
          type: 'NETWORK',
          message: err.message || 'Network connection failure.',
          cause: err,
        } satisfies NetworkError;
      }
    }

    throw {
      type: 'SERVER',
      httpCode: 503,
      message: 'Service unavailable.',
    } satisfies ServerError;
  }
}

export const httpClient = new HttpClient();
