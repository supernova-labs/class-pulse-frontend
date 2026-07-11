# ADR 0002 — API types generated from the OpenAPI contract

Date: 2026-07-11
Status: accepted

## Context

Backend and frontend live in separate repositories; SCOPE.md mandates a CI check that
fails on API contract drift. The client needs TypeScript types for every request and
response.

## Decision

`src/api/schema.d.ts` is **generated** by `openapi-typescript` from the backend's
committed `openapi.json` (`bun run gen:api`), and consumed through `openapi-fetch`,
which types paths, params and bodies from that schema. The file is committed, never
hand-edited, and excluded from Biome. CI downloads the contract from the backend's
`main`, regenerates and fails on any diff.

## Alternatives considered

- **Hand-written client + interfaces**: drifts silently; the CI drift check would
  compare nothing real.
- **Runtime validation (zod) of responses**: catches drift in production instead of
  CI, and duplicates the schema by hand.
- **Monorepo shared types package**: solves the same problem but contradicts the
  two-repo decision made for the workshop's microservices discussion.

## Consequences

- A breaking API change is a *visible* two-step dance: backend PR updates
  `openapi.json` → merge → frontend PR regenerates types (drift check enforces it).
- `openapi-fetch` adds ~2 kB and zero codegen at runtime.
- The generated file's shape depends on the pinned `openapi-typescript` version;
  regeneration and comparison always run with the version in `bun.lock`.
