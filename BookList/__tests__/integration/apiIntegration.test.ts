import { spawn, ChildProcess } from "child_process";
import path from "path";
import { authService } from "../../services/auth/authService";
import { bookServiceImpl } from "../../services/servicesImpl/bookServiceImpl";
import { httpClient } from "../../services/api/httpClient";

const API_DIR = path.resolve(__dirname, "../../../api-books-v2");
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
const ADMIN_USERNAME = process.env.EXPO_PUBLIC_ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD;

const hasCredentials = Boolean(ADMIN_USERNAME && ADMIN_PASSWORD);
const describeSuite = hasCredentials ? describe : describe.skip;

describeSuite("Real API Connection & Integration Suite", () => {
  let apiProcess: ChildProcess | null = null;

  async function isApiHealthy(): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  }

  beforeAll(async () => {
    const alreadyRunning = await isApiHealthy();
    if (!alreadyRunning) {
      // Spawn real backend server with AUTH_REQUIRED=true
      apiProcess = spawn(process.execPath, ["src/server.js"], {
        cwd: API_DIR,
        env: { ...process.env, PORT: "3000", AUTH_REQUIRED: "true" },
        stdio: "ignore",
      });

      // Poll health check until API is up (max 10 seconds)
      const startTime = Date.now();
      while (Date.now() - startTime < 10000) {
        if (await isApiHealthy()) break;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }, 15000);

  afterAll(async () => {
    if (apiProcess) {
      apiProcess.kill();
    }
  });

  it("should connect to the live API and verify health status", async () => {
    const health = await httpClient.request<{
      statut: string;
      version: string;
    }>("/health");
    expect(health.statut).toBe("ok");
    expect(health.version).toBe("2.0.0");
  });

  it("should authenticate with real credentials from .env and retrieve a valid JWT access token", async () => {
    const user = await authService.login(ADMIN_USERNAME, ADMIN_PASSWORD);

    expect(user.email).toBe(ADMIN_USERNAME);
    expect(user.role).toBe("editeur");
    expect(authService.getAccessToken()).toBeTruthy();
    expect(authService.getStatus()).toBe("authenticated");
  });

  it("should fetch live paginated books from real api-books-v2 database via bookRepository", async () => {
    const paginated = await bookServiceImpl.getBooks({ limit: 5 });

    expect(paginated.items.length).toBeGreaterThan(0);
    expect(paginated.limit).toBe(5);
    expect(paginated.items[0]).toHaveProperty("id");
    expect(paginated.items[0]).toHaveProperty("titre");
  });

  it("should execute live token refresh against POST /auth/refresh", async () => {
    const newToken = await authService.refreshTokens();

    expect(newToken).toBeTruthy();
    expect(authService.getAccessToken()).toBe(newToken);
  });
});
