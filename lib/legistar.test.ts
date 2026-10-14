// Normalization tests (milestone 3): raw Legistar shapes → app contracts.
// Fixtures mirror the real field shapes observed in milestone 1.

import { describe, expect, it } from "vitest";
import {
  normalizeItemForTest,
  normalizeMeetingForTest,
} from "./legistar";

type RawEvent = Parameters<typeof normalizeMeetingForTest>[0];
type RawEventItem = Parameters<typeof normalizeItemForTest>[0];

function rawEvent(overrides: Partial<RawEvent> = {}): RawEvent {
  return {
    EventId: 14161,
    EventDate: "2026-10-19T00:00:00",
    EventTime: "7:00 PM",
    EventBodyName: "City Council",
    EventAgendaStatusName: "Final",
    EventMinutesStatusName: "Draft",
    EventAgendaFile: "https://a2gov.legistar1.com/a2gov/meetings/2026/10/14161_A.pdf",
    EventMinutesFile: null,
    EventInSiteURL: "https://a2gov.legistar.com/MeetingDetail.aspx?LEGID=14161",
    EventMedia: null,
    EventComment: "To sign up for public comment, call 734-794-6140.",
    EventAgendaLastPublishedUTC: "2026-10-13T21:02:14.25",
    EventMinutesLastPublishedUTC: null,
    EventLastModifiedUtc: "2026-10-13T21:02:14.377",
    EventRowVersion: "AAAAAAHu5nQ=",
    ...overrides,
  };
}

function rawItem(overrides: Partial<RawEventItem> = {}): RawEventItem {
  return {
    EventItemId: 226529,
    EventItemEventId: 14160,
    EventItemAgendaSequence: 68,
    EventItemAgendaNumber: "CA-12",
    EventItemTitle:
      "Resolution to Approve the Purchase of Property at 6 Park View Place for Affordable Housing",
    EventItemAgendaNote: null,
    EventItemMinutesNote: null,
    EventItemActionId: 383,
    EventItemActionName: "Approved",
    EventItemActionText: null,
    EventItemPassedFlag: 1,
    EventItemPassedFlagName: "Pass",
    EventItemConsent: 1,
    EventItemMover: "Erica \r\nBriggs",
    EventItemSeconder: "Travis Radina",
    EventItemMatterId: 39216,
    EventItemMatterFile: "26-1379",
    EventItemMatterName: "10/5/26 Acquisition of 6 Park View Place AAHDC",
    EventItemMatterType: "Resolution",
    EventItemMatterStatus: "Passed",
    EventItemMatterAttachments: [],
    EventItemLastModifiedUtc: "2026-10-07T20:45:28.007",
    ...overrides,
  };
}

describe("normalizeMeeting", () => {
  it("slices the date to YYYY-MM-DD and passes status fields through", () => {
    const m = normalizeMeetingForTest(rawEvent(), "2026-10-14T12:00:00Z");
    expect(m.id).toBe(14161);
    expect(m.date).toBe("2026-10-19");
    expect(m.time).toBe("7:00 PM");
    expect(m.agendaStatus).toBe("Final");
    expect(m.minutesStatus).toBe("Draft");
    expect(m.lastCheckedAt).toBe("2026-10-14T12:00:00Z");
  });

  it("keeps null agenda/minutes files as null (unpublished state)", () => {
    const m = normalizeMeetingForTest(
      rawEvent({ EventAgendaFile: null, EventAgendaStatusName: "Draft" }),
      "2026-10-14T12:00:00Z"
    );
    expect(m.agendaUrl).toBeNull();
    expect(m.agendaStatus).toBe("Draft");
  });
});

describe("normalizeItem", () => {
  it("maps the passed flag: 1 → true, 0 → false, null → null", () => {
    expect(normalizeItemForTest(rawItem({ EventItemPassedFlag: 1 }), "").passed).toBe(true);
    expect(normalizeItemForTest(rawItem({ EventItemPassedFlag: 0 }), "").passed).toBe(false);
    expect(
      normalizeItemForTest(rawItem({ EventItemPassedFlag: null }), "").passed
    ).toBeNull();
  });

  it("maps the consent flag", () => {
    expect(normalizeItemForTest(rawItem({ EventItemConsent: 1 }), "").consent).toBe(true);
    expect(normalizeItemForTest(rawItem({ EventItemConsent: 0 }), "").consent).toBe(false);
  });

  it("detects topics from title and matter name", () => {
    const item = normalizeItemForTest(rawItem(), "");
    expect(item.topics).toContain("housing");
    expect(item.topics).toContain("budget"); // "Purchase" keyword
  });

  it("collapses whitespace and newlines in titles and names", () => {
    const item = normalizeItemForTest(
      rawItem({ EventItemTitle: "CALL\r\n  TO \r\nORDER", EventItemMover: "Erica \r\nBriggs" }),
      ""
    );
    expect(item.title).toBe("CALL TO ORDER");
    expect(item.mover).toBe("Erica Briggs");
  });

  it("marks procedural filler items (no matter, no action)", () => {
    const procedural = [
      "CALL TO ORDER",
      "MOMENT OF SILENCE",
      "PLEDGE OF ALLEGIANCE",
      "ROLL CALL OF COUNCIL",
      "APPROVAL OF AGENDA",
      "PUBLIC COMMENTARY (3 MINUTES PER SPEAKER, 45 MINUTES TOTAL)",
      "COMMUNICATIONS FROM THE CITY ADMINISTRATOR",
      "INTRODUCTIONS",
      "ADJOURNMENT",
      "\r\n", // blank titles seen in the live data
    ];
    for (const title of procedural) {
      const item = normalizeItemForTest(
        rawItem({
          EventItemTitle: title,
          EventItemMatterId: null,
          EventItemActionId: null,
          EventItemActionName: null,
        }),
        ""
      );
      expect(item.procedural).toBe(true);
    }
  });

  it("does NOT mark substantive items procedural, even with similar words", () => {
    // Has a matter and an action → substantive, even though "communications"
    // appears in procedural patterns.
    const item = normalizeItemForTest(rawItem(), "");
    expect(item.procedural).toBe(false);
  });

  it("marks items without a matter as procedural even when they have an action", () => {
    // Adjournment, consent-umbrella rows, and agenda approval all carry
    // actions but no matter record — they are scaffolding, not content.
    const cases = [
      { EventItemTitle: "ADJOURNMENT", EventItemActionName: "Adjourn" },
      { EventItemTitle: "Passed on consent agenda", EventItemActionName: "Approved as presented" },
      { EventItemTitle: "APPROVAL OF AGENDA", EventItemActionName: "Approved with changes" },
    ];
    for (const c of cases) {
      const item = normalizeItemForTest(
        rawItem({ ...c, EventItemMatterId: null }),
        ""
      );
      expect(item.procedural).toBe(true);
    }
  });

  it("marks public-comment speaker sign-up slots as procedural", () => {
    const item = normalizeItemForTest(
      rawItem({
        EventItemAgendaNumber: "1.",
        EventItemTitle: "Brian Chambers - Resolution to Approve a Professional Services Agreement (Zoom)",
        EventItemMatterId: null,
        EventItemActionId: null,
        EventItemActionName: null,
      }),
      ""
    );
    expect(item.procedural).toBe(true);
  });

  it("keeps attachments with hyperlinks and drops ones without", () => {
    const item = normalizeItemForTest(
      rawItem({
        EventItemMatterAttachments: [
          { MatterAttachmentName: "Staff report", MatterAttachmentHyperlink: "https://example.com/a.pdf" },
          { MatterAttachmentName: "Broken entry" },
        ],
      }),
      ""
    );
    expect(item.attachments).toEqual([
      { name: "Staff report", url: "https://example.com/a.pdf" },
    ]);
  });

  it("links the item back to the official meeting page", () => {
    const item = normalizeItemForTest(rawItem(), "https://a2gov.legistar.com/MeetingDetail.aspx?LEGID=14160");
    expect(item.insiteUrl).toBe("https://a2gov.legistar.com/MeetingDetail.aspx?LEGID=14160");
  });
});
