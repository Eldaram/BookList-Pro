import { loginResponseSchema, meResponseSchema, refreshResponseSchema } from './schemas';
import { API_CONFIG } from '../config';
import { z } from 'zod';
import { AuthError, NetworkError } from '../../domain/error';

export type LoginResponse = z.infer<typeof loginResponseSchema>;
export type RefreshResponse = z.infer<typeof refreshResponseSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, motDePasse: password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw {
        type: 'AUTH' as const,
        reason: (data.erreur as any) || 'token_invalid',
        message: data.message || 'Login failed.',
      } satisfies AuthError;
    }

    return loginResponseSchema.parse(data);
  } catch (err: any) {
    if (err.type === 'AUTH') throw err;
    throw {
      type: 'NETWORK' as const,
      message: err.message || 'Unable to connect to authentication server.',
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

    const data = await response.json();
    if (!response.ok) {
      throw {
        type: 'AUTH' as const,
        reason: (data.erreur as any) || 'token_invalid',
        message: data.message || 'Failed to refresh token.',
      } satisfies AuthError;
    }

    return refreshResponseSchema.parse(data);
  } catch (err: any) {
    if (err.type === 'AUTH') throw err;
    throw {
      type: 'NETWORK' as const,
      message: err.message || 'Network error during token refresh.',
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

    const data = await response.json();
    if (!response.ok) {
      throw {
        type: 'AUTH' as const,
        reason: (data.erreur as any) || 'token_invalid',
        message: data.message || 'Invalid session.',
      } satisfies AuthError;
    }

    return meResponseSchema.parse(data);
  } catch (err: any) {
    if (err.type === 'AUTH') throw err;
    throw {
      type: 'NETWORK' as const,
      message: err.message || 'Network error checking user session.',
      cause: err,
    } satisfies NetworkError;
  }
}
