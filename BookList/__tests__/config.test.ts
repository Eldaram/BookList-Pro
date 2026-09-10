describe("API Config Validation", () => {
  const originalEnv = process.env.EXPO_PUBLIC_API_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_API_URL = originalEnv;
    jest.resetModules();
  });

  it("should throw an error immediately if EXPO_PUBLIC_API_URL is missing or empty", async () => {
    delete process.env.EXPO_PUBLIC_API_URL;
    jest.resetModules();

    await expect(import("../services/config")).rejects.toThrow(
      "[CONFIG ERROR] EXPO_PUBLIC_API_URL environment variable is missing.",
    );
  });

  it("should load API_CONFIG when EXPO_PUBLIC_API_URL is provided", async () => {
    process.env.EXPO_PUBLIC_API_URL = "http://localhost:3000";
    jest.resetModules();

    const { API_CONFIG } = await import("../services/config");
    expect(API_CONFIG.baseUrl).toBe("http://localhost:3000");
  });
});
