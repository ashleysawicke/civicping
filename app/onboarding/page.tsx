
// Onboarding: pick topics + ward so the feed can be ranked. Stored on-device.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TOPICS } from "@/lib/topics";
import { WARDS } from "@/lib/wards";
import { loadPrefs, savePrefs } from "@/lib/preferences";

export default function OnboardingPage() {
  const router = useRouter();
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
    savePrefs({ topics, ward, onboarded: true });
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Personalize your feed
        </h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          We use this only to rank agenda items. Stored on your device — it
          never leaves your phone.
        </p>
      </div>

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
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
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

      <div className="space-y-2">
        <button
          type="button"
          onClick={save}
          className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-blue-700 text-base font-semibold text-white"
        >
          Save and see my feed
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[44px] w-full items-center justify-center text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}
