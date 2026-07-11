# ADR 0006 — Self-contained Playwright stack on an isolated test database

Date: 2026-07-11
Status: accepted

## Context

The first e2e implementation ran against the dev backend (port 8000, dev database):
it created "E2E Run…" sessions in dev data and — because only one session may be
active — **ended whatever session the developer was using**. The defense-team
requirement says test data must never pollute what you see while browsing.

## Decisions

1. **Playwright boots the whole stack itself** via the `webServer` array:
   - backend on port **8001**: `alembic downgrade base && upgrade head && uvicorn`,
     with `DATABASE_URL` pointing at `classpulse_test` (env beats `.env` in
     pydantic-settings, so no backend code changes) and `ADMIN_PASSWORD=admin`;
   - Vite on port **5174** with `VITE_API_URL=http://127.0.0.1:8001`.
2. **Dedicated ports + `reuseExistingServer: false`** guarantee the test UI can never
   silently reuse a dev server wired to the dev database.
3. **Schema reset on boot** wipes leftovers from previous runs; the backend's pytest
   fixture does the same on its side. The two share `classpulse_test`, so running
   them simultaneously is documented as unsupported.
4. `e2e:headed` and `e2e:slow` (SLOWMO env → launchOptions) exist for live demos.

## Alternatives considered

- **Keep hitting the dev backend**: one command less, but violates the isolation
  requirement in the most user-visible way possible.
- **A third database for e2e**: cleaner separation from pytest, not worth another
  moving part at this scale (reset-on-start gives the same guarantee in practice).
- **Docker-compose test profile**: heavier startup per run than reusing the existing
  Postgres container with a second database.

## Consequences

- `bun run e2e` is one command; the only prerequisite is the Compose Postgres.
- e2e adds ~5s of stack boot per run (migrations + two servers).
- A crashed run can orphan port 8001 (`lsof -ti:8001 | xargs kill`, documented).
