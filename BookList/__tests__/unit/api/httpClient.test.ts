import { httpClient } from "../../../services/api/httpClient";
import { authService } from "../../../services/auth/authService";
import { z } from "zod";

const globalFetch = global.fetch;

type MutableAuthService = {
  accessToken: string | null;
  refreshPromise: Promise<string> | null;
};

describe("HttpClient Interceptors & Resiliency", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authService as unknown as MutableAuthService).accessToken = null;
    (authService as unknown as MutableAuthService).refreshPromise = null;
  });

  afterAll(() => {
    global.fetch = globalFetch;
  });

  it("should inject Bearer token into Authorization header when available", async () => {
    (authService as unknown as MutableAuthService).accessToken =
      "test-access-token";

    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "ok" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    await httpClient.request("/health");

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [, options] = mockFetch.mock.calls[0] as [
      string,
      RequestInit & { headers: Record<string, string> },
    ];
    expect(options.headers["Authorization"]).toBe("Bearer test-access-token");
  });

  it("should automatically refresh token on 401 jeton_expire and retry request", async () => {
    (authService as unknown as MutableAuthService).accessToken =
      "expired-token";
    jest
      .spyOn(authService, "refreshTokens")
      .mockResolvedValue("new-fresh-token");

    let callCount = 0;
    const mockFetch = jest.fn().mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return {
          ok: false,
          status: 401,
          json: async () => ({
            erreur: "jeton_expire",
            message: "Jeton expiré",
          }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({ success: true }),
      };
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const result = await httpClient.request<{ success: boolean }>("/books");

    expect(authService.refreshTokens).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ success: true });
  });

  it("should validate response against Zod schema and throw ErreurValidation if payload is invalid", async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ invalidField: 123 }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    const testSchema = z.object({
      requiredName: z.string(),
    });

    await expect(
      httpClient.request("/test", { schema: testSchema }),
    ).rejects.toMatchObject({
      type: "VALIDATION",
    });
  });
});
