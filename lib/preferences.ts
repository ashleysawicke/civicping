// Resident preferences: stored on-device only, never sent to a server.
import type { ResidentPrefs } from "./types";

const STORAGE_KEY = "civicping:prefs";

export const DEFAULT_PREFS: ResidentPrefs = {
  topics: [],
  ward: null,
  onboarded: false,
};

export function loadPrefs(): ResidentPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<ResidentPrefs>;
    return {
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      ward:
        typeof parsed.ward === "number" &&
        Number.isInteger(parsed.ward) &&
        parsed.ward >= 1 &&
        parsed.ward <= 5
          ? parsed.ward
          : null,
      onboarded: parsed.onboarded === true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: ResidentPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or unavailable — preferences simply won't persist.
  }
}
