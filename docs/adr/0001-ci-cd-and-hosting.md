# ADR 0001 — CI/CD and hosting architecture

Date: 2026-07-11
Status: accepted

## Context

The original plan (SCOPE.md) placed the frontend on Vercel. During the CI/CD phase we
revisited this: Class Pulse is a demo/workshop app, the backend already lives on
Cloud Run in GCP project `class-pulse-502114`, and a second hosting platform adds an
account, tokens and mental surface that a demo doesn't justify.

## Decisions

1. **Frontend also deploys to Cloud Run** (`class-pulse-web`, southamerica-east1):
   a Vite static build served by nginx with SPA fallback (`try_files $uri /index.html`)
   and immutable caching for hashed assets. Same project, same service account, same
   workflow shape as the backend. Trade-off accepted: no per-PR preview deploys.
2. **`VITE_API_URL` is baked at build time** via Docker build-arg from the repository
   variable `API_URL` (the backend's Cloud Run URL). Vite inlines env at build, so the
   image is environment-specific; the deploy fails fast if the variable is unset.
3. **Contract-drift check in CI**: the workflow downloads `openapi.json` from the
   backend repo's `main`, regenerates `src/api/schema.d.ts` and fails on any diff —
   the deployed frontend can never be built against a stale contract.
4. **ADR gate**: PRs touching architectural files (deps, build config, Dockerfile,
   nginx, workflows, API client wiring) fail CI unless they touch `docs/adr/` or carry
   the `no-adr` label.

## Consequences

- Merge to `main` is the only deployment path; the backend must be deployed (and its
  URL stored in the `API_URL` repo variable) before the first frontend deploy.
- A breaking backend contract change lands as: backend PR (updates `openapi.json`) →
  merge → frontend PR regenerating types (drift check enforces it).
- Preview environments, if ever needed, can be added later with Cloud Run tagged
  revisions or by reconsidering Vercel.
