/**
 * User roles recognized across the application.
 */
export const ROLES = {
  EDITOR: "editeur",
  READER: "lecteur",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Authenticated user entity.
 */
export type User = {
  id: string;
  email: string;
  role: Role;
  authRequise?: boolean;
};

/**
 * JWT and refresh token payload returned upon successful authentication.
 */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | string;
};

/**
 * Credentials submitted for signing in.
 */
export type LoginCredentials = {
  email: string;
  motDePasse: string;
};

/**
 * Session status for the active client.
 */
export type AuthStatus =
  "unauthenticated" | "authenticated" | "reconnect_required";
