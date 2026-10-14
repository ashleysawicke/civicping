// Feed ranking: pure function, no I/O, runs on server or client.
// Complexity: O(n * t) where n = items, t = resident's selected topics
// (t <= 9). Keyword detection already ran during normalization, so ranking
// is a linear scan over small arrays — trivially fast even on a phone.

import type { AgendaItem, MatchReason, RankedItem, ResidentPrefs } from "./types";
import { topicLabel } from "./topics";

const TOPIC_WEIGHT = 10;
const WARD_WEIGHT = 6;
const CONSENT_PENALTY = 2; // consent items are routine; keep them visible but lower

/** Extract a ward reference like "Ward 3" from an item title, if present. */
function detectWardMention(title: string): number | null {
  const m = title.match(/\bward\s*([1-5])\b/i);
  return m ? parseInt(m[1], 10) : null;
}

export function rankItems(items: AgendaItem[], prefs: ResidentPrefs): RankedItem[] {
  const ranked: RankedItem[] = [];

  for (const item of items) {
    if (item.procedural) continue; // never surface procedural filler in the feed
    let score = 0;
    const reasons: MatchReason[] = [];

    for (const slug of item.topics) {
      if (prefs.topics.includes(slug)) {
        score += TOPIC_WEIGHT;
        reasons.push({ kind: "topic", label: `Matches your topic: ${topicLabel(slug)}` });
      }
    }

    if (prefs.ward != null) {
      const mentioned = detectWardMention(item.title);
      if (mentioned === prefs.ward) {
        score += WARD_WEIGHT;
        reasons.push({ kind: "ward", label: `Mentions Ward ${prefs.ward}` });
      }
    }

    if (item.consent && item.actionName) score -= CONSENT_PENALTY;

    // Items with no signal still appear (score 0), below matched ones.
    ranked.push({ ...item, score, reasons });
  }

  ranked.sort((a, b) => b.score - a.score || a.sequence - b.sequence);
  return ranked;
}
