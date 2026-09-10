import { AuthStatus, User } from "../../domain/auth";
import { AuthError } from "../../domain/error";
import { loginApi, refreshApi, getMeApi } from "../api/authApi";
import { secureStorage } from "../secureStorage";

const REFRESH_TOKEN_KEY = "BOOKLIST_REFRESH_TOKEN";

type AuthSubscriber = (status: AuthStatus, user: User | null) => void;

class AuthService {
  private accessToken: string | null = null;
  private currentUser: User | null = null;
  private status: AuthStatus = "unauthenticated";
  private subscribers: Set<AuthSubscriber> = new Set();
  private refreshPromise: Promise<string> | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getStatus(): AuthStatus {
    return this.status;
  }

  subscribe(subscriber: AuthSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber(this.status, this.currentUser);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    for (const sub of this.subscribers) {
      sub(this.status, this.currentUser);
    }
  }

  async login(email: string, password: string): Promise<User> {
    const data = await loginApi(email, password);

    this.accessToken = data.accessToken;
    this.currentUser = data.utilisateur;
    this.status = "authenticated";

    await secureStorage.setSecureItem(REFRESH_TOKEN_KEY, data.refreshToken);
    this.notify();

    return this.currentUser;
  }

  /**
   * Single-flight token refresh mutex.
   * Ensures that concurrent callers wait for the same refresh network call.
   */
  async refreshTokens(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const storedRefreshToken =
          await secureStorage.getSecureItem(REFRESH_TOKEN_KEY);
        if (!storedRefreshToken) {
          await this.logout("reconnect_required");
          throw {
            type: "AUTH",
            reason: "reconnect_required",
            message: "Refresh token missing. Please log in again.",
          } satisfies AuthError;
        }

        const data = await refreshApi(storedRefreshToken);
        this.accessToken = data.accessToken;
        this.status = "authenticated";
        this.notify();

        return data.accessToken;
      } catch (err) {
        await this.logout("reconnect_required");
        throw err;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  async checkAuthSanity(): Promise<AuthStatus> {
    const storedRefreshToken =
      await secureStorage.getSecureItem(REFRESH_TOKEN_KEY);
    if (!storedRefreshToken) {
      this.status = "unauthenticated";
      this.currentUser = null;
      this.accessToken = null;
      this.notify();
      return "unauthenticated";
    }

    try {
      const newToken = await this.refreshTokens();
      const user = await getMeApi(newToken);
      this.currentUser = user;
      this.status = "authenticated";
      this.notify();
      return "authenticated";
    } catch {
      this.status = "reconnect_required";
      this.currentUser = null;
      this.accessToken = null;
      this.notify();
      return "reconnect_required";
    }
  }

  async logout(reason: AuthStatus = "unauthenticated"): Promise<void> {
    this.accessToken = null;
    this.currentUser = null;
    this.status = reason;
    await secureStorage.removeSecureItem(REFRESH_TOKEN_KEY);
    this.notify();
  }
}

export const authService = new AuthService();
