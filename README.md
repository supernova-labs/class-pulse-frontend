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
bun install
bun run dev        # http://localhost:5173
```

Routes: `/join` (participant entry), `/s/{code}` (ask & vote),
`/screen/{code}` (big screen), `/admin` (password-protected management).

## Tests

```bash
bun run test       # Jest (unit/component)
bun run e2e        # Playwright happy path — backend must be running
```

## API contract

Types in `src/api/schema.d.ts` are generated from the backend OpenAPI schema:

```bash
bun run gen:api    # regenerates from http://localhost:8000/openapi.json
```
