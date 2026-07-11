# Class Pulse — Frontend

Live Q&A web app (Slido-style) for workshops: participant screen, admin panel and
the "Nebulosa" big-screen view where questions float as stars sized by votes.
React + TypeScript + Tailwind v4, built with Vite, managed with Bun. Product
source of truth lives in the workspace root: `../SCOPE.md`.

## Requirements

- [Bun](https://bun.sh)
- The backend running locally (see `../backend/README.md`)

## Getting started

```bash
bun install        # also installs the pre-commit hook (prepare script)
bun run dev        # http://localhost:5173
```

Routes: `/join` (participant entry), `/s/{code}` (ask & vote),
`/screen/{code}` (big screen), `/admin` (password-protected management).

## Tests

```bash
bun run test        # Jest (unit/component)
bun run e2e         # Playwright happy path — self-contained (see below)
bun run e2e:headed  # same, with a visible Chrome window
```

The e2e is fully isolated: Playwright itself starts the backend on port 8001 against
the `classpulse_test` database (schema reset + migrations) and a dedicated Vite on
port 5174. The only prerequisite is the Postgres container (`docker compose up -d` in
`../backend`). Dev servers and dev data are never touched. Don't run the backend's
`pytest` at the same time — both use `classpulse_test`. If a crashed run leaves port
8001 busy: `lsof -ti:8001 | xargs kill`.

## Lint & format

```bash
bun run lint       # biome check (also runs in pre-commit, plus jest)
bun run format     # biome format --write
```

`src/api/schema.d.ts` is generated and excluded from Biome. The pre-commit hook is
installed automatically by `bun install`; bypass with `git commit --no-verify`.

## CI/CD

Every PR runs biome, jest, the production build, a contract-drift check (regenerates
`src/api/schema.d.ts` from the backend's committed `openapi.json` and fails on diff)
and an ADR gate (architectural changes require a `docs/adr/` entry or the `no-adr`
label). Merging to `main` builds the nginx image (with `VITE_API_URL` from the
`API_URL` repo variable) and deploys to Cloud Run (`class-pulse-web`,
southamerica-east1). See `docs/adr/0001`.

## API contract

Types in `src/api/schema.d.ts` are generated from the backend OpenAPI schema:

```bash
bun run gen:api    # regenerates from http://localhost:8000/openapi.json
```
