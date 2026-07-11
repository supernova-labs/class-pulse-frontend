# ADR 0003 — TanStack Query polling + optimistic vote toggle

Date: 2026-07-11
Status: accepted

## Context

Three surfaces need the same live data (ranked questions + session status) and votes
must feel instant on tap. The backend deliberately exposes polling, not push
(backend ADR 0002).

## Decisions

1. **One realtime primitive**: `useQuestionsPolling` wraps a single `useQuery` with
   `refetchInterval: 2500` and `refetchIntervalInBackground: true` (the projected
   screen tab is rarely focused). Participant list, Nebulosa and admin counters all
   consume it. Polling stops automatically when the payload says the session ended.
2. **Optimistic vote toggle**: `useVoteToggle` patches the cached question on click
   (count ± 1, `voted_by_me` flipped), rolls back **only the affected question** on
   error (concurrent votes on other questions survive), and invalidates on settle so
   the next poll reconciles. The tapped button disables while its request is in
   flight, serializing rapid toggles per question.
3. Derived lists are memoized on `query.data` so unchanged polls don't re-render the
   constellation.

## Alternatives considered

- **Hand-rolled fetch hooks**: would re-implement cache, dedupe, focus handling and
  interval logic that TanStack Query ships battle-tested.
- **Non-optimistic votes**: a 2.5s wait after tapping reads as broken on stage.
- **Whole-cache snapshot rollback**: simpler, but an error in one vote would clobber
  another in-flight vote's optimistic state (flagged in code review).

## Consequences

- Perceived latency: votes instant, everything else ≤ one poll interval.
- All server state flows through one query key family — no bespoke stores.
- The 2.5s interval is a single constant (`POLL_INTERVAL_MS`) if it ever needs tuning.
