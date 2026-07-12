# Architecture — Class Pulse Frontend

Reusable design principles for this repo. The design pipeline (`triage → design → develop`)
reads this first: if a principle already answers an open question, the design session is
"consult", not "debate". Seeded from `CLAUDE.md` and the codebase.

## Data & Realtime

### Server state lives in TanStack Query; realtime is polling

All server data flows through TanStack Query. Realtime updates are done by polling
(2.5s in `useQuestionsPolling`), not websockets.

**Why:** The product is low-frequency (classroom Q&A); polling is simpler to reason about
and self-heals on transient errors. A live screen survives a failed poll.

**Scope:** Any feature reading server data or needing "live" updates.

**Origem:** Seed, 2026-07-12.

## Configuration

### `appConfig.ts` is the only module that reads `import.meta.env`

Environment access is centralized in `src/appConfig.ts` (stubbed by Jest). No other module
reads `import.meta.env` directly.

**Why:** One seam to stub in tests; one place to see all runtime config.

**Scope:** Anything needing env vars, base URLs, or build-time flags.

**Origem:** Seed, 2026-07-12.

## API Contract

### API types are generated from the backend OpenAPI contract, never hand-edited

Types come from `bun run gen:api` into `src/api/schema.d.ts`. Never edit that file by hand.
The backend contract is the source of truth.

**Why:** Keeps front/back in lockstep; hand edits drift and lie.

**Scope:** Any change touching request/response shapes.

**Origem:** Seed, 2026-07-12.

## Security

### User-authored content is never trusted as markup

Question bodies and author names are user input. They must be escaped before rendering and
never injected as raw HTML/CSS/JS. (See issue #8: unescaped `formatText` + `dangerouslySetInnerHTML`
let a student's question rewrite the app's theme — stored XSS.)

**Why:** The telão and lists render other people's input on a shared screen; injection there
hits everyone in the room.

**Scope:** Any surface that renders question bodies, author names, or other participant input.

**Origem:** Issue #8, 2026-07-12.

## Derived Artifacts

### Derived artifacts are generated client-side, not via external services

Anything derivable from session data (QR codes, thumbnails, exports) is generated in the
browser, not by sending the data to a third-party service.

**Why:** Privacy (the session code/URL never leaks to a third party) and it works
offline / with no network dependency — aligned with the project's self-contained ethos.

**Scope:** Any feature that produces an artifact from session data.

**Origem:** Issue #7, 2026-07-12.
