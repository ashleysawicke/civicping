// Settings: edit topics + ward, or reset personalization. All on-device.
"use client";

import { useState } from "react";
import Link from "next/link";
import PreferencesForm from "@/components/PreferencesForm";
import { DEFAULT_PREFS, savePrefs } from "@/lib/preferences";

export default function SettingsPage() {
  const [savedTick, setSavedTick] = useState(0);
  const [justSaved, setJustSaved] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  function reset() {
    savePrefs(DEFAULT_PREFS);
    setConfirmingReset(false);
    setJustSaved(false);
    // Remount the form so it reloads the cleared preferences.
    setSavedTick((t) => t + 1);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Everything here is stored only on your device.
        </p>
      </div>

      <PreferencesForm
        key={savedTick}
        saveLabel="Save settings"
        intro="Change what your feed is ranked by. Items matching your topics or mentioning your ward float to the top."
        onSaved={() => setJustSaved(true)}
      />
      {justSaved && (
        <p role="status" className="text-sm font-medium text-green-700 dark:text-green-400">
          Saved — your feed is now ranked with these preferences.
        </p>
      )}

      <section aria-label="Reset" className="border-t border-neutral-200 pt-6 dark:border-neutral-800">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Start over
        </h2>
        {confirmingReset ? (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Clear your topics and ward? Your feed will return to plain
              agenda order.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-red-700 text-base font-semibold text-white"
              >
                Yes, reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmingReset(false)}
                className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-neutral-300 text-base font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
              >
                Keep mine
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingReset(true)}
            className="mt-2 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-neutral-300 text-base font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300"
          >
            Reset personalization
          </button>
        )}
      </section>

      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Privacy note: your topics and ward live in this browser&apos;s local
        storage on your device. CivicPing has no accounts and sends nothing
        about you to any server.
      </p>

      <Link
        href="/"
        className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
      >
        ← Back to feed
      </Link>
    </div>
  );
}
