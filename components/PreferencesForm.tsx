// Topics + ward editor, shared by onboarding and settings.
// State lives here; the parent decides what "save" means.
"use client";

import { useEffect, useState } from "react";
import { TOPICS } from "@/lib/topics";
import { WARDS } from "@/lib/wards";
import { WARD_MAP_DATA_URI } from "@/lib/ward-map-data";
import { loadPrefs, savePrefs } from "@/lib/preferences";
import type { ResidentPrefs } from "@/lib/types";

export default function PreferencesForm({
  saveLabel,
  intro,
  onSaved,
}: {
  saveLabel: string;
  intro: string;
  onSaved: (prefs: ResidentPrefs) => void;
}) {
  const [topics, setTopics] = useState<string[]>([]);
  const [ward, setWard] = useState<number | null>(null);

  useEffect(() => {
    const p = loadPrefs();
    setTopics(p.topics);
    setWard(p.ward);
  }, []);

  function toggleTopic(slug: string) {
    setTopics((t) =>
      t.includes(slug) ? t.filter((s) => s !== slug) : [...t, slug]
    );
  }

  function save() {
    const prefs: ResidentPrefs = { topics, ward, onboarded: true };
    savePrefs(prefs);
    onSaved(prefs);
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{intro}</p>

      <section aria-label="Topics">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Topics you care about
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const selected = topics.includes(t.slug);
            return (
              <button
                key={t.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTopic(t.slug)}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                  selected
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section aria-label="Ward">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Your ward
        </h2>
        <figure className="mt-2">
          <img
            src={WARD_MAP_DATA_URI}
            alt="Map of Ann Arbor's five City Council wards, numbered 1 through 5"
            className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800"
            loading="lazy"
          />
          <figcaption className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
            Find your ward on the map, then pick it below. Not sure? The
            city&apos;s website can look it up by address.
          </figcaption>
        </figure>
        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          We&apos;ll surface items that mention your ward.
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {WARDS.map((w) => {
            const selected = ward === w;
            return (
              <button
                key={w}
                type="button"
                aria-pressed={selected}
                onClick={() => setWard(w)}
                className={`inline-flex min-h-[48px] items-center justify-center rounded-xl border text-base font-semibold transition-colors ${
                  selected
                    ? "border-blue-700 bg-blue-700 text-white"
                    : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                }`}
              >
                Ward {w}
              </button>
            );
          })}
          <button
            type="button"
            aria-pressed={ward === null}
            onClick={() => setWard(null)}
            className={`inline-flex min-h-[48px] items-center justify-center rounded-xl border text-base font-medium transition-colors ${
              ward === null
                ? "border-blue-700 bg-blue-700 text-white"
                : "border-neutral-300 bg-white text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
            }`}
          >
            Skip
          </button>
        </div>
      </section>

      <button
        type="button"
        onClick={save}
        className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-700 text-base font-semibold text-white"
      >
        {saveLabel}
      </button>
    </div>
  );
}
