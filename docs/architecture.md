# CivicPing architecture note

Written 2026-10-14 during milestone 2. Goal: explain the full stack, the
significant systems tradeoffs, and where performance work would matter.

## Data flow

```
Legistar Web API (webapi.legistar.com/v1/a2gov, anonymous HTTPS)
        │  GET Events / Events/{id} / Matters/{id} / EventItems/{id}/Votes
        ▼
lib/legistar.ts  (server only)
  ├─ file cache  (.cache/legistar/*.json — gitignored)
  ├─ normalize   (raw Legistar fields → lib/types.ts contracts)
  └─ detectTopics / isProcedural
        ▼
app/api/*  (Next.js route handlers — the browser-facing API)
  ├─ GET /api/meetings            → MeetingSummary[]
  ├─ GET /api/meetings/[id]       → MeetingDetail (items included)
  ├─ GET /api/matters/[id]        → MatterDetail (history timeline)
  └─ GET /api/items/[id]/votes    → VoteRecord[]
        ▼
React client (mobile-first pages)
  ├─ rankItems(items, prefs)      (lib/ranking.ts — runs in the browser)
  ├─ prefs                       (localStorage — never leaves the device)
  └─ verified demo summaries      (lib/demo-summaries.ts — static, reviewed)
```

Raw Legistar field names never cross the API boundary. If the upstream
schema changes, only `lib/legistar.ts` changes.

## Why this stack

- **Next.js App Router, one codebase:** the plan asked for a server-side
  agenda adapter plus a browser-facing API. Route handlers give us both
  without a separate backend service to deploy or keep awake.
- **Server-side fetching:** keeps the Legistar URL shapes, cache files, and
  normalization quirks off the client; also lets us degrade gracefully to
  stale cache when the upstream API fails.
- **No database (yet):** meeting data is read-mostly and upstream is the
  source of truth. A file cache with TTLs is simpler than Postgres for the
  prototype and makes the invalidation policy explicit and reviewable.
- **Preferences in localStorage:** the prototype deliberately avoids
  accounts, cookies, and sending location to any AI service. The tradeoff:
  prefs don't roam across devices — acceptable for a prototype.

## Cache invalidation

Two tiers, chosen per meeting from its date:

| Tier | TTL | Used for |
|---|---|---|
| Upcoming | 15 min | next meeting's agenda (agendas get revised — Oct 5 went `Final` → `Final-revised` and was republished the night of the meeting) |
| Past | 24 h | older meetings (minutes get finalized days later; still recheck daily) |

Revision keys (from milestone 1): `EventLastModifiedUtc`,
`EventRowVersion`, `EventAgendaLastPublishedUTC`, plus the agenda/minutes
status names. The adapter must re-fetch when any of these move — never cache
by title alone, since titles are reused across meetings ("Communications
from Council" appears every session) and the same matter appears under
different agenda numbers as it moves through readings.

Failure mode: if the upstream fetch fails and cache exists, serve stale data
with its original `lastCheckedAt`. Every API response carries
`lastCheckedAt`, and the UI renders it — the app never silently presents
old data as fresh.

## Ranking complexity

`rankItems` is O(n · t): n agenda items (typically 40–80 per meeting),
t selected topics (≤ 9). Topic detection already ran during normalization,
so ranking is a single linear pass over small arrays — microseconds, even
on a low-end phone. No memoization needed; no virtualized list needed at
this n. If the corpus ever grew (e.g., full-text search across years of
minutes), the honest next step would be an inverted index, not a faster
comparator.

The scoring is deliberately transparent and explainable: +10 per matched
topic, +6 for a ward mention, −2 for consent-agenda routine items. The UI
shows the reasons, so a resident can audit why an item surfaced. This is a
product choice as much as an engineering one — a black-box ranker would be
inappropriate for civic information.

## Where runtime / memory profiling would be meaningful

1. **Agenda payload size.** A full event with items is ~100–200 KB of JSON.
   Fine for one meeting, but a "browse all meetings" view fetching N
   meetings naively would be N × that. Profile the meetings list endpoint
   before adding infinite scroll — paginate or slim the payload (summaries
   already exclude items for exactly this reason).
2. **Cache directory growth.** The file cache is append-only by URL. With
   15-minute TTLs on live data it churns constantly; without eviction it
   grows unbounded. A real deployment needs TTL-based eviction or an LRU
   cap — measure directory size under a week of polling before choosing.
3. **Client bundle.** `demo-summaries.ts` and `topics.ts` ship to the
   browser. They're kilobytes today; if the verified-summary set grows to
   hundreds of items, move summaries behind the API and fetch per item.
4. **Fetch waterfalls.** The item page needs meeting → item → matter →
   history. Currently each API route fetches independently; a slow
   upstream multiplies latency. If this shows up in profiling, batch the
   matter+history fetch server-side inside the item route.

## Known limitations (prototype)

- eComment availability isn't in the API; the app links to the official
  meeting page and states the 4 p.m. rule honestly.
- Voice votes record people, not positions (`VoteValueName` null). The app
  shows per-person votes only when values exist — verified against live
  data, not assumed.
- Ward → representative mapping is unverified and intentionally absent;
  the email action drafts by ward and hands the resident the official
  directory. Confirm before resident testing.
- Per-matter attachments were empty in samples; the UI handles empty
  attachment lists as normal, not as errors.
