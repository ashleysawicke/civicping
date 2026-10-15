// What-is-this-app explainer, opened from the "?" button in the header.
"use client";

import { useEffect } from "react";

export default function HelpModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-xl dark:bg-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="help-title"
            className="text-lg font-bold text-neutral-900 dark:text-neutral-100"
          >
            What is CivicPing?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xl text-neutral-500 dark:text-neutral-400"
          >
            ×
          </button>
        </div>

        <div className="mt-3 space-y-4 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <p>
            CivicPing helps Ann Arbor residents follow City Council without
            reading hundred-page agendas. It shows you the items relevant to
            you, explains them in plain language, and tells you how to weigh
            in before the vote.
          </p>

          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Where the information comes from
            </p>
            <p>
              Every agenda, vote, and document is pulled live from the
              city&apos;s official Legistar system — the same source the
              council itself uses. We never invent details.
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Verified summary vs. summary pending
            </p>
            <p>
              A <em>verified summary</em> is a human-checked plain-language
              explanation with links to the official source.{" "}
              <em>Summary pending</em> means no one has verified that item
              yet — we show the official title instead of guessing.
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              What the badges mean
            </p>
            <p>
              “Awaiting decision” marks an upcoming vote. Outcome badges like
              “Approved” report what the council decided, taken from the
              official minutes — never inferred.
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Take action
            </p>
            <p>
              Each item links to the city&apos;s official comment page and
              helps you draft an email or sign up to speak. Nothing is ever
              submitted on your behalf.
            </p>
          </div>

          <div>
            <p className="font-semibold text-neutral-900 dark:text-neutral-100">
              Your privacy
            </p>
            <p>
              Your topics and ward are stored only on your device. CivicPing
              has no accounts and sends nothing about you to a server.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
