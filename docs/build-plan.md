# CivicPing: first build plan

Prepared September 24, 2026. Reviewed before implementation.

## Outcome

Build a mobile-first web app that demonstrates one trustworthy civic loop for Ann Arbor City Council: read a published agenda, find a few relevant items by resident-selected topics and ward, explain each item in plain language with its original source, offer a clear action handoff, and show an official outcome when one exists.

This is a local prototype for a capstone and resident testing. A reliable public launch requires more data validation, usability research, accessibility checks, and operations work.

## First build scope

1. **Agenda ingestion:** Fetch Ann Arbor Council meetings and items from official Legistar data. Try the documented Legistar API first. Its Ann Arbor client access and token requirement have not yet been verified; test that before implementing the adapter. Keep the fetched meeting, item IDs, source URLs, retrieval time, and revision/status. Show an honest state when an upcoming agenda has not been published.
2. **Personalization:** Ask for a few topics and a ward selected by the resident. Rank by explicit topic matches and verified ward references, and show why each result appears. Store preferences on the device. Use approximate geographic matching only after the source location has been verified; a street, home, or commute map comes later.
3. **Explanation:** Provide short, neutral summaries grounded in the item title and official supporting materials. Link the original item and attachments and show when the content was last checked. For a small historical demo set, review summaries before they appear. For new items that lack a verified summary, show the official title and label the explanation as pending.
4. **Action:** Link to the city's eComment when the published agenda enables it, offer an editable email draft addressed to the resident's ward representatives, and show the Clerk's speaking-signup instructions. The app labels these as opening or drafting actions; residents review and submit in the official system or their own mail app.
5. **Follow-up:** Read official actions and minutes when available. Show pending, draft, or final accurately. Show how individual representatives voted only when the official record identifies their votes.
6. **Demo and verification:** Include one clearly labeled historical meeting so the whole flow can be demonstrated even when the next agenda is unpublished. Test phone layout, source links, matching logic, agenda revisions, empty states, and action wording.

## Technical shape

- One TypeScript web codebase with a mobile-first interface, server-side agenda adapter, and a small persistent cache. A browser-facing API returns normalized meeting and item records. The adapter isolates Legistar details from the user interface.
- Keep user topic and ward choices in local device storage for the prototype. Avoid storing precise home/work coordinates or sending them to an AI service.
- Treat the same matter's multiple agenda appearances and actions as a timeline. Cache by stable IDs and revision dates rather than title alone.
- A source-grounded summary pipeline can be added behind a server boundary. Live AI generation requires an API credential and review of factual quality; the prototype's verified demo summaries do not depend on a user API key.
- Write a short architecture note that explains data flow, cache invalidation, ranking complexity, and where runtime or memory profiling would be meaningful. This supports the user's software engineering learning goal.

## Milestones and evidence

| Milestone | Deliverable | Completion check |
| --- | --- | --- |
| 1. Source check | API access result and one official meeting sample | Agenda, item, and outcome fields mapped; access limitation recorded |
| 2. Working loop | Mobile feed, item detail, preferences, action handoffs, outcome state | A resident can complete the flow in the local app |
| 3. Quality pass | Focused normalization and ranking tests, phone-size walkthrough, README | Tests pass; sample/live data are visibly distinguished; links open the correct official source |

One agent owns integration and shared files. Bounded agents can independently handle official data research, interface implementation in separate files, and quality review. The integrator reviews each contribution and runs the app before reporting. Save progress in the repository so work can resume if the usage window runs out.

## Source checks and product rules

- [Ann Arbor Council calendar and agendas](https://a2gov.legistar.com/Calendar.aspx) and [city meeting guide](https://www.a2gov.org/city-clerk/city-council-meetings/): the October 5 meeting is listed but its agenda/eComment are not yet published as of September 24. Written eComment is offered with published agendas and closes at 4 p.m. on meeting day.
- [Public commentary rules](https://www.a2gov.org/city-council/council-meetings-overview/): the 45-minute cap concerns the beginning-of-meeting oral comment period; overflow speakers may speak later. Public hearing items have separate rules.
- [Legistar API documentation](https://webapi.legistar.com/Help): events, agenda items, histories, and votes are documented; Ann Arbor API access still needs a live smoke test.
- [City Council representatives](https://www.a2gov.org/city-council/): two representatives per ward, across five wards, plus the mayor.
- [Ward and precinct map data](https://data.a2gov.org/city-of-ann-arbor/wards-and-precincts): possible later address-to-ward source.
