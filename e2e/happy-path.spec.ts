import type { APIRequestContext } from "@playwright/test";
import { expect, request, test } from "@playwright/test";

const API_URL = process.env.E2E_API_URL ?? "http://127.0.0.1:8001";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin";

let api: APIRequestContext;
let sessionCode: string;
let sessionId: string;
let token: string;

test.beforeAll(async () => {
  api = await request.newContext({ baseURL: API_URL });

  const health = await api.get("/healthz").catch(() => null);
  if (!health?.ok()) {
    throw new Error(`Backend not reachable at ${API_URL} — start it before running e2e.`);
  }

  const login = await api.post("/admin/login", { data: { password: ADMIN_PASSWORD } });
  expect(login.ok()).toBeTruthy();
  token = (await login.json()).token;
  const auth = { Authorization: `Bearer ${token}` };

  // Only one session can be active: end whatever is running before creating ours.
  const sessions = await (await api.get("/admin/sessions", { headers: auth })).json();
  const active = sessions.find((s: { status: string }) => s.status === "active");
  if (active) {
    await api.post(`/admin/sessions/${active.id}/end`, { headers: auth });
  }

  const created = await api.post("/admin/sessions", {
    headers: auth,
    data: { name: `E2E Run ${Date.now()}` },
  });
  expect(created.status()).toBe(201);
  const session = await created.json();
  sessionCode = session.code;
  sessionId = session.id;
});

test.afterAll(async () => {
  if (sessionId && token) {
    await api.post(`/admin/sessions/${sessionId}/end`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  await api.dispose();
});

test("participant joins, asks, votes and the question reaches the telão", async ({ browser }) => {
  const uniqueBody = `Pergunta E2E ${Date.now()}?`;

  // Participant context
  const participant = await browser.newContext();
  const page = await participant.newPage();
  await page.goto("/join");
  await page.getByLabel("Código do workshop").fill(sessionCode);
  await page.getByLabel("Seu nome (opcional)").fill("E2E Tester");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(new RegExp(`/s/${sessionCode}`));

  // Ask a question
  await page.getByLabel("Escreva sua pergunta").fill(uniqueBody);
  await page.getByRole("button", { name: "Enviar" }).click();
  await expect(page.getByText(uniqueBody)).toBeVisible();

  // Vote toggle: vote, unvote, vote again
  const voteButton = page.getByRole("button", { name: "Votar" });
  await voteButton.click();
  await expect(page.getByRole("button", { name: "Remover voto" })).toHaveText(/1/);
  await page.getByRole("button", { name: "Remover voto" }).click();
  await expect(page.getByRole("button", { name: "Votar" })).toHaveText(/0/);
  await page.getByRole("button", { name: "Votar" }).click();
  await expect(page.getByRole("button", { name: "Remover voto" })).toHaveText(/1/);

  // Telão context: question appears via polling with its vote count
  const screen = await browser.newContext();
  const screenPage = await screen.newPage();
  await screenPage.goto(`/screen/${sessionCode}`);
  await expect(screenPage.getByText(uniqueBody)).toBeVisible({ timeout: 10_000 });
  await expect(screenPage.getByTestId("nebula-star").filter({ hasText: uniqueBody })).toContainText(
    "▲ 1",
  );

  await participant.close();
  await screen.close();
});
