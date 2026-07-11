# ADR 0004 — Participant identity in localStorage, no login

Date: 2026-07-11
Status: accepted

## Context

The product has no login (join with an optional name), but voting requires a stable
per-participant identity, and returning through the join link must not mint a new
one (votes would stop showing as "mine").

## Decisions

1. On join, the backend returns a participant UUID; the frontend persists
   `{participantId, displayName}` under `cp:participant:{CODE}` — **scoped per
   session code**, so one device can hold identities for several classes.
2. `/join?code=X` reuses a stored identity and skips the join call entirely;
   `useParticipant` re-syncs when the route's code changes (SPA navigation between
   sessions can't leak the previous identity).
3. `voted_by_me` always comes from the API (the backend computes it from the explicit
   participant id) — localStorage never mirrors vote state.
4. Storage access is wrapped with an in-memory fallback (Safari private mode) and
   JSON shape validation, so corrupted entries degrade to "join again" instead of a
   broken session view.

## Alternatives considered

- **Cookie/JWT sessions**: login friction the product explicitly rejects.
- **Mirroring voted ids in localStorage**: drifts the moment storage is cleared or a
  second device is used; the API is the source of truth.
- **Identity per device (not per session)**: would cross-link votes between classes
  and break the backend's participant-belongs-to-session invariant.

## Consequences

- Clearing browser storage creates a fresh participant (accepted for a closed room).
- No PII is required or stored beyond an optional display name.
