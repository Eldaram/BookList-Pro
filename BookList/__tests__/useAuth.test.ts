import { authService } from "../services/auth/authService";
import { secureStorage } from "../services/secureStorage";
import * as authApi from "../services/api/authApi";

jest.mock("../services/api/authApi");
jest.mock("../services/secureStorage");

describe("Auth Feature & State Suite", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await authService.logout();
  });

  it("should initialize unauthenticated when no refresh token is stored", async () => {
    (secureStorage.getSecureItem as jest.Mock).mockResolvedValue(null);

    const status = await authService.checkAuthSanity();

    expect(status).toBe("unauthenticated");
    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.getAccessToken()).toBeNull();
  });

  it("should execute login and notify subscribers with authenticated status", async () => {
    (secureStorage.getSecureItem as jest.Mock).mockResolvedValue(null);
    const mockUser = {
      id: "u1",
      email: "test@booklist.fr",
      role: "editeur" as const,
    };
    (authApi.loginApi as jest.Mock).mockResolvedValue({
      accessToken: "acc-123",
      refreshToken: "ref-123",
      expiresIn: 3600,
      utilisateur: mockUser,
    });

    const statusHistory: string[] = [];
    const unsubscribe = authService.subscribe((status) => {
      statusHistory.push(status);
    });

    const user = await authService.login("test@booklist.fr", "password123");

    expect(user).toEqual(mockUser);
    expect(authService.getStatus()).toBe("authenticated");
    expect(authService.getCurrentUser()).toEqual(mockUser);
    expect(authService.getAccessToken()).toBe("acc-123");
    expect(statusHistory).toContain("authenticated");

    unsubscribe();
  });

  it("should execute logout, remove refresh token, and notify subscribers", async () => {
    await authService.logout();

    expect(authService.getStatus()).toBe("unauthenticated");
    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.getAccessToken()).toBeNull();
    expect(secureStorage.removeSecureItem).toHaveBeenCalledWith(
      "BOOKLIST_REFRESH_TOKEN",
    );
  });
});
