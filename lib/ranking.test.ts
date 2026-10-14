// Ranking tests (milestone 3): scoring, reasons, ordering, exclusions.
// rankItems is O(n·t); these tests pin the scoring contract the UI explains.

import { describe, expect, it } from "vitest";
import { rankItems } from "./ranking";
import type { AgendaItem, ResidentPrefs } from "./types";

function item(overrides: Partial<AgendaItem> = {}): AgendaItem {
  return {
    id: 1,
    meetingId: 14161,
    sequence: 10,
    agendaNumber: "CA-1",
    title: "Resolution to do something",
    topics: [],
    procedural: false,
    actionName: null,
    actionText: null,
    passed: null,
    minutesNote: null,
    consent: false,
    mover: null,
    seconder: null,
    matter: null,
    attachments: [],
    insiteUrl: "https://a2gov.legistar.com/MeetingDetail.aspx?LEGID=14161",
    lastModifiedUtc: "2026-10-13T21:02:14.377",
    ...overrides,
  };
}

const prefs: ResidentPrefs = { topics: ["housing", "transportation"], ward: 3, onboarded: true };
const noPrefs: ResidentPrefs = { topics: [], ward: null, onboarded: false };

describe("rankItems", () => {
  it("scores +10 per matched topic and explains why", () => {
    const [ranked] = rankItems(
      [item({ id: 1, topics: ["housing"], title: "Affordable housing purchase" })],
      prefs
    );
    expect(ranked.score).toBe(10);
    expect(ranked.reasons).toHaveLength(1);
    expect(ranked.reasons[0].kind).toBe("topic");
    expect(ranked.reasons[0].label).toContain("Housing");
  });

  it("accumulates multiple topic matches", () => {
    const [ranked] = rankItems(
      [item({ id: 1, topics: ["housing", "transportation"] })],
      prefs
    );
    expect(ranked.score).toBe(20);
    expect(ranked.reasons).toHaveLength(2);
  });

  it("scores +6 for an explicit ward mention matching the resident's ward", () => {
    const [ranked] = rankItems(
      [item({ id: 1, title: "Rezoning near Ward 3 park", topics: [] })],
      prefs
    );
    expect(ranked.score).toBe(6);
    expect(ranked.reasons[0]).toEqual({ kind: "ward", label: "Mentions Ward 3" });
  });

  it("ignores ward mentions for a different ward", () => {
    const [ranked] = rankItems(
      [item({ id: 1, title: "Rezoning near Ward 2 park", topics: [] })],
      prefs
    );
    expect(ranked.score).toBe(0);
    expect(ranked.reasons).toHaveLength(0);
  });

  it("penalizes routine consent items by 2 (but keeps them visible)", () => {
    const [ranked] = rankItems(
      [item({ id: 1, topics: ["housing"], consent: true, actionName: "Approved" })],
      prefs
    );
    expect(ranked.score).toBe(8); // 10 - 2
  });

  it("excludes procedural items from the feed entirely", () => {
    const ranked = rankItems(
      [item({ id: 1, procedural: true, topics: ["housing"] }), item({ id: 2, topics: [] })],
      prefs
    );
    expect(ranked.map((r) => r.id)).toEqual([2]);
  });

  it("sorts by score descending, breaking ties by agenda sequence", () => {
    const ranked = rankItems(
      [
        item({ id: 1, sequence: 30, topics: [] }),
        item({ id: 2, sequence: 10, topics: ["housing"] }),
        item({ id: 3, sequence: 20, topics: ["housing"] }),
      ],
      prefs
    );
    expect(ranked.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it("with no preferences, keeps agenda order and zero scores", () => {
    const ranked = rankItems(
      [item({ id: 1, sequence: 30 }), item({ id: 2, sequence: 10 })],
      noPrefs
    );
    expect(ranked.map((r) => r.id)).toEqual([2, 1]);
    expect(ranked.every((r) => r.score === 0)).toBe(true);
  });

  it("never mutates the input items", () => {
    const input = [item({ id: 1, topics: ["housing"] })];
    rankItems(input, prefs);
    expect(input[0]).not.toHaveProperty("score");
    expect(input[0]).not.toHaveProperty("reasons");
  });
});
