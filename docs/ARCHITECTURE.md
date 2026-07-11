# Class Pulse Frontend — Architecture

React SPA with three surfaces: **participant** (join by code, ask, vote),
**big screen** ("Nebulosa" — questions float as stars sized by votes) and **admin**
(password login, session lifecycle, moderation). Product source of truth:
`SCOPE.md` in the workspace root. This document describes how the frontend is built;
the ADRs under [`docs/adr/`](adr/) record why.

## System context

```
Browser ──► this SPA (nginx on Cloud Run) ──► FastAPI backend (REST, polling 2.5s)
```

The SPA talks **only** to the backend API — no direct database or Supabase client.
Its TypeScript types are generated from the backend's committed OpenAPI contract,
so the client cannot drift from the API
([ADR 0002](adr/0002-generated-api-types.md)).

## Stack

React 19 · TypeScript · Tailwind v4 (CSS-first tokens) · Vite · Bun (PM/runner) ·
TanStack Query v5 · React Router v7 · Biome · Jest + Testing Library · Playwright.

## Module map

```
src/
├── main.tsx            providers: ErrorBoundary > QueryClient > Router
├── App.tsx             routes: /join · /s/:code · /screen/:code · /admin · 404
├── appConfig.ts        the ONLY module reading import.meta.env (Jest stubs it)
├── index.css           Tailwind v4 @theme tokens + keyframes (design prototype port)
├── api/
│   ├── schema.d.ts     GENERATED from openapi.json — never hand-edited
│   ├── client.ts       openapi-fetch instance, bearer middleware, ApiError
│   └── sessions.ts / admin.ts / types.ts
├── hooks/
│   ├── useQuestionsPolling.ts  the single realtime primitive (2.5s refetch)
│   ├── useVoteToggle.ts        optimistic mutation with per-question rollback
│   ├── useParticipant.ts       localStorage identity, synced to route code
│   └── useAdminAuth.ts         token state; 401 anywhere → logout
├── lib/
│   ├── storage.ts       namespaced localStorage + in-memory fallback
│   ├── sortQuestions.ts pure ranking (open first, votes desc, created_at asc)
│   └── nebula.ts        pure constellation layout (slots, scale, brightness)
├── components/          ui/ · questions/ · nebula/ · admin/
└── pages/               one file per route
```

## Data layer

- **Contract-generated client**: `bun run gen:api` regenerates `schema.d.ts` from the
  backend; `openapi-fetch` gives typed paths/bodies. CI re-generates against the
  backend's `main` and fails on diff ([ADR 0002](adr/0002-generated-api-types.md)).
- **Realtime = polling**: one `useQuery` with `refetchInterval: 2500` feeds
  participant, big screen and admin counters; polling stops automatically on ended
  sessions ([ADR 0003](adr/0003-polling-and-optimistic-ui.md)).
- **Votes are optimistic**: cache is patched on click, rolled back per-question on
  error, reconciled by the next poll; the button disables while its request flies.
- **Identity**: participant UUID per session code in localStorage; `voted_by_me`
  comes from the API, never a local mirror
  ([ADR 0004](adr/0004-local-identity.md)).

## The Nebulosa

`computeNebulaLayout` is a pure function (fully unit-tested, no DOM): deterministic
slot table (1 center + 8 orbit), size/brightness ∝ √(votes/max), recently answered
stars park dimmed at the edges. Rendering is plain DOM/CSS — absolutely-positioned
divs keyed by question id whose `left/top/transform/opacity` transition on change,
so rank moves glide with no JS animation loop, text stays crisp on a projector and
Playwright can find questions by text ([ADR 0005](adr/0005-nebulosa-dom-css.md)).

## Resilience & a11y

Global ErrorBoundary (logs + `role="alert"` fallback); a live big screen survives
transient poll failures (hard error only before first data); ended sessions render
read-only from the first paint; async errors carry `role="alert"`; storage reads
validate their JSON shape.

## Testing

- **Jest** (jsdom + Testing Library, @swc/jest): pure functions (nebula, sorting,
  storage), optimistic toggle semantics, component states. `appConfig` is mapped to
  a stub so `import.meta` never reaches Jest.
- **Playwright e2e**: fully isolated stack — the config spawns the backend on port
  8001 against `classpulse_test` (schema reset + migrations) and a dedicated Vite on
  5174; dev servers/data are never touched. `e2e:headed` / `e2e:slow` for demos
  ([ADR 0006](adr/0006-isolated-e2e.md)).

## Delivery

Pre-commit (biome + jest, installed by `bun install`). CI: lint, tests, build,
contract-drift, ADR gate. Merge to `main` builds the nginx image (SPA fallback,
immutable asset caching) with `VITE_API_URL` baked in and deploys to Cloud Run —
see [ADR 0001](adr/0001-ci-cd-and-hosting.md).

## ADR index

| # | Decision |
|---|----------|
| [0001](adr/0001-ci-cd-and-hosting.md) | CI/CD and hosting (Cloud Run instead of Vercel) |
| [0002](adr/0002-generated-api-types.md) | API types generated from the OpenAPI contract |
| [0003](adr/0003-polling-and-optimistic-ui.md) | TanStack Query polling + optimistic vote toggle |
| [0004](adr/0004-local-identity.md) | Participant identity in localStorage, no login |
| [0005](adr/0005-nebulosa-dom-css.md) | Nebulosa rendered in DOM/CSS with a pure layout function |
| [0006](adr/0006-isolated-e2e.md) | Self-contained Playwright stack on an isolated test database |
