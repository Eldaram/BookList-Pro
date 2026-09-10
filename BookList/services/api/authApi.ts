import { loginResponseSchema, meResponseSchema, refreshResponseSchema } from './schemas';
import { API_CONFIG } from '../config';
import { z } from 'zod';
import { AuthError, AuthReason, NetworkError } from '../../domain/error';

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;

function isAuthError(err: unknown): err is AuthError {
  return typeof err === 'object' && err !== null && (err as { type?: string }).type === 'AUTH';
}

function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as { message: unknown }).message === 'string') {
    return (err as { message: string }).message;
  }
  return defaultMsg;
}

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, motDePasse: password }),
    });

    const data: Record<string, unknown> = await response.json();
    if (!response.ok) {
      throw {
        type: 'AUTH' as const,
        reason: typeof data.erreur === 'string' ? (data.erreur as AuthReason) : 'token_invalid',
        message: typeof data.message === 'string' ? data.message : 'Login failed.',
      } satisfies AuthError;
    }

    return loginResponseSchema.parse(data);
  } catch (err: unknown) {
    if (isAuthError(err)) throw err;
    throw {
      type: 'NETWORK' as const,
      message: getErrorMessage(err, 'Unable to connect to authentication server.'),
      cause: err,
    } satisfies NetworkError;
  }
}

export async function refreshApi(refreshToken: string): Promise<RefreshResponse> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data: Record<string, unknown> = await response.json();
    if (!response.ok) {
      throw {
        type: 'AUTH' as const,
        reason: typeof data.erreur === 'string' ? (data.erreur as AuthReason) : 'token_invalid',
        message: typeof data.message === 'string' ? data.message : 'Failed to refresh token.',
      } satisfies AuthError;
    }

    return refreshResponseSchema.parse(data);
  } catch (err: unknown) {
    if (isAuthError(err)) throw err;
    throw {
      type: 'NETWORK' as const,
      message: getErrorMessage(err, 'Network error during token refresh.'),
      cause: err,
    } satisfies NetworkError;
  }
}

export async function getMeApi(accessToken: string): Promise<MeResponse> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data: Record<string, unknown> = await response.json();
    if (!response.ok) {
      throw {
        type: 'AUTH' as const,
        reason: typeof data.erreur === 'string' ? (data.erreur as AuthReason) : 'token_invalid',
        message: typeof data.message === 'string' ? data.message : 'Invalid session.',
      } satisfies AuthError;
    }

    return meResponseSchema.parse(data);
  } catch (err: unknown) {
    if (isAuthError(err)) throw err;
    throw {
      type: 'NETWORK' as const,
      message: getErrorMessage(err, 'Network error checking user session.'),
      cause: err,
    } satisfies NetworkError;
  }
}
