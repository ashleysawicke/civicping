# Milestone 1 — Source Check (completed 2026-10-14)

## Verdict
Ann Arbor's Legistar data is accessible **without any token or authentication** over plain HTTPS.
The earlier concern about client access/token requirements is retired: anonymous GETs work.

## Endpoints verified (base: `https://webapi.legistar.com/v1/a2gov/`)

| Endpoint | Result |
|---|---|
| `GET Events` (+ OData `$filter`, `$orderby`, `$top`) | Works. Full event list; filterable by body and date. |
| `GET Events/{id}?EventItems=1&AgendaNote=1&MinutesNote=1&EventItemAttachments=1` | Works. Full agenda + minutes notes + attachment lists per item. |
| `GET Matters/{id}` | Works. File no., type, status, dates, enactment no., requester, cost. |
| `GET Matters/{id}/Histories` | Works. Per-meeting timeline for one matter. |
| `GET Matters/{id}/Attachments` | Works, returned `[]` for the sampled matter (only internet-viewable attachments are exposed). |
| `GET EventItems/{id}/Votes` | Works, with quirks (see below). |

## Live sample: October 2026 meetings (City Council, BodyId 138)

- **Oct 19, 2026 (EventId 14161)** — upcoming. Agenda status `Final`, published 2026-10-13. Minutes status `Draft` (none yet). Ideal "upcoming agenda" demo input.
- **Oct 5, 2026 (EventId 14160)** — past. Agenda `Final-revised`, minutes `Draft`, action-minutes PDF + YouTube video linked. Ideal "outcome" demo input.

### Sample item → outcome trace
- Item `CA-12` (EventItemId 226529): "Resolution to Approve the Purchase of Property at 6 Park View Place for Affordable Housing" → Action `Approved`, PassedFlag `Pass`, mover Erica Briggs, seconder Travis Radina, consent agenda.
- Linked matter `26-1379` (MatterId 39216): Resolution, status `Passed`, enactment `R-26-387`, requester Housing Commission, cost $11,000,000.
- Histories for the matter return its per-meeting timeline (supports the "one matter, many appearances" timeline design).

## Field map (adapter contract)

- **Event**: `EventId`, `EventGuid`, `EventDate`, `EventTime`, `EventBodyId/Name`, `EventAgendaStatusName` (`Final` / `Final-revised` / …), `EventMinutesStatusName` (`Draft` / `Final`), `EventAgendaFile`, `EventMinutesFile`, `EventAgendaLastPublishedUTC`, `EventMinutesLastPublishedUTC`, `EventLastModifiedUtc`, `EventRowVersion`, `EventInSiteURL`, `EventComment` (speaking-signup instructions live here).
- **EventItem**: `EventItemId`, `EventItemAgendaSequence`, `EventItemAgendaNumber` (`CA`/`PH`/`B`/`C`/`F`/`AC`/`INT`/`CC`/`MC`), `EventItemTitle`, `EventItemActionId/Name` (383 = `Approved`, 370 = `Adopted on Second Reading`, 372 = `Approved on First Reading`, 398 = `Held and Closed`), `EventItemPassedFlag/Name`, `EventItemMinutesNote`, `EventItemConsent`, `EventItemMover/Seconder` (+Ids), `EventItemMatterId/Guid/File/Name/Type/Status`, `EventItemMatterAttachments[]`, `EventItemLastModifiedUtc`, `EventItemRowVersion`.
- **Matter**: `MatterId`, `MatterFile`, `MatterTitle`, `MatterTypeName`, `MatterStatusName`, `MatterIntroDate`, `MatterAgendaDate`, `MatterPassedDate`, `MatterEnactmentDate`, `MatterEnactmentNumber`, `MatterRequester`, `MatterCost`, `MatterLastModifiedUtc`, `MatterRowVersion`.

## Cache-invalidation keys
`EventLastModifiedUtc` + `EventRowVersion` + `EventAgendaLastPublishedUTC` + agenda/minutes status names. The Oct 5 agenda was republished (`Final-revised`, republished 2026-10-05) — the adapter must re-fetch on status/last-published change, not just on first sighting.

## Quirks and product implications

1. **Votes endpoint returns vote records for a *different* EventItemId** than requested (asked 226529, got records tagged 226927). Do not assume `VoteEventItemId` matches the query item; the adapter must handle/verify this.
2. **Voice votes record people, not positions**: all `VoteValueName` values were `null`. Per the product rule, the app shows per-representative votes only when the official record identifies them — which means: show mover/seconder + "voice vote, declared carried" text, and never invent individual yes/no votes.
3. **Attachments can be empty** on matters (`[]`); agenda/minutes PDFs live at the event level. Item-level attachments array exists but was empty in samples.
4. **Procedural items** (call to order, roll call, public commentary) have null matter/action fields — the feed should filter or de-emphasize them.
5. `EventComment` carries the public-comment signup instructions verbatim — usable for the action handoff.

## Limitations recorded
- eComment availability is not exposed via this API; it must be detected from the published agenda page state (per plan: offered with published agendas, closes 4pm meeting day).
- Vote values are null for voice votes; roll-call votes may differ — needs one roll-call sample to confirm.
- Per-matter attachments were empty in the sample; verify on a matter known to have attachments before relying on them for source links.
