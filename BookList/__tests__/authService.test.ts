import { authService } from "../services/auth/authService";
import * as authApi from "../services/api/authApi";
import { secureStorage } from "../services/secureStorage";

jest.mock("../services/api/authApi");
jest.mock("../services/secureStorage");

describe("AuthService Suite", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should authenticate user and store tokens securely on login", async () => {
    const mockLoginResponse = {
      accessToken: "access-123",
      refreshToken: "refresh-456",
      expiresIn: 120,
      utilisateur: {
        id: "u1",
        email: "editeur@booklist.fr",
        role: "editeur" as const,
      },
    };

    (authApi.loginApi as jest.Mock).mockResolvedValue(mockLoginResponse);

    const user = await authService.login("editeur@booklist.fr", "editeur123");

    expect(authApi.loginApi).toHaveBeenCalledWith(
      "editeur@booklist.fr",
      "editeur123",
    );
    expect(secureStorage.setSecureItem).toHaveBeenCalledWith(
      "BOOKLIST_REFRESH_TOKEN",
      "refresh-456",
    );
    expect(authService.getAccessToken()).toBe("access-123");
    expect(user.email).toBe("editeur@booklist.fr");
    expect(authService.getStatus()).toBe("authenticated");
  });

  it("should single-flight concurrent token refreshes", async () => {
    (secureStorage.getSecureItem as jest.Mock).mockResolvedValue(
      "refresh-token-active",
    );
    (authApi.refreshApi as jest.Mock).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ accessToken: "new-acc-tok", expiresIn: 120 }),
            50,
          ),
        ),
    );

    // Call refreshTokens 3 times simultaneously
    const p1 = authService.refreshTokens();
    const p2 = authService.refreshTokens();
    const p3 = authService.refreshTokens();

    const [t1, t2, t3] = await Promise.all([p1, p2, p3]);

    expect(authApi.refreshApi).toHaveBeenCalledTimes(1);
    expect(t1).toBe("new-acc-tok");
    expect(t2).toBe("new-acc-tok");
    expect(t3).toBe("new-acc-tok");
  });

  it("should clear session on logout", async () => {
    await authService.logout();

    expect(authService.getAccessToken()).toBeNull();
    expect(authService.getCurrentUser()).toBeNull();
    expect(authService.getStatus()).toBe("unauthenticated");
    expect(secureStorage.removeSecureItem).toHaveBeenCalledWith(
      "BOOKLIST_REFRESH_TOKEN",
    );
  });
});
