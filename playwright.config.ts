import { defineConfig, devices } from "@playwright/test";

// E2E runs against a fully isolated stack: its own backend (8001) on the
// classpulse_test database and its own Vite (5174). The dev servers and the
// dev database are never touched.
const E2E_UI_PORT = 5174;
const E2E_API_PORT = 8001;
const E2E_API_URL = `http://127.0.0.1:${E2E_API_PORT}`;
const TEST_DATABASE_URL =
  "postgresql+asyncpg://classpulse:classpulse@localhost:5432/classpulse_test";

export default defineConfig({
  testDir: "e2e",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${E2E_UI_PORT}`,
    trace: "retain-on-failure",
    // e2e:slow sets SLOWMO (ms between actions) to make headed runs watchable
    launchOptions: { slowMo: Number(process.env.SLOWMO) || 0 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // Reset schema (wipes previous e2e leftovers), migrate, serve the API.
      command: `uv run alembic downgrade base && uv run alembic upgrade head && uv run uvicorn app.main:app --port ${E2E_API_PORT}`,
      cwd: "../backend",
      url: `${E2E_API_URL}/healthz`,
      env: { DATABASE_URL: TEST_DATABASE_URL, ADMIN_PASSWORD: "admin" },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `bunx vite --port ${E2E_UI_PORT} --strictPort`,
      url: `http://localhost:${E2E_UI_PORT}`,
      env: { VITE_API_URL: E2E_API_URL },
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
