# CivicPing

A phone-friendly civic information app for Ann Arbor residents who don't regularly follow City Council.

**Core loop:** ingest the published council agenda → show each resident the items relevant to them → explain each item in plain language with links to primary sources → make it easy to take action (comment, email, speak) → report official meeting outcomes.

**Audience:** renters, commuters, homeowners, parents, and new residents. Features and audience assumptions are to be validated with actual residents, not assumed.

## Status

- **Milestone 1 — Source check: complete** (2026-10-14). Ann Arbor's Legistar API is publicly accessible with no token. See [`docs/milestone-1-source-check.md`](docs/milestone-1-source-check.md) for the endpoint verification, field map, and data quirks.
- **Milestone 2 — Working loop: complete** (2026-10-14). Mobile feed, item detail, preferences, action handoffs, and outcome states — all verified against live Legistar data with `npm run build` + local smoke test.

## Docs

- [`docs/build-plan.md`](docs/build-plan.md) — first build plan: scope, technical shape, milestones.
- [`docs/milestone-1-source-check.md`](docs/milestone-1-source-check.md) — Legistar API verification and adapter contract.

## Tech direction

One TypeScript web codebase, mobile-first UI, server-side Legistar adapter, small persistent cache. User topic/ward preferences stay in on-device storage for the prototype.

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

No API keys needed — the Legistar API is public. The server caches upstream
responses in `.cache/legistar/` (gitignored): 15-minute TTL for upcoming
meetings, 24-hour TTL for past meetings.

## Data source

[Ann Arbor Legistar](https://a2gov.legistar.com/Calendar.aspx) via the public [Legistar Web API](https://webapi.legistar.com/Help) (`https://webapi.legistar.com/v1/a2gov/`).
