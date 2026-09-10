export type Role = "editeur" | "lecteur";

export type User = {
  id: string;
  email: string;
  role: Role;
  authRequise?: boolean;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number | string;
};

export type LoginCredentials = {
  email: string;
  motDePasse: string;
};

export type AuthStatus =
  "unauthenticated" | "authenticated" | "reconnect_required";
