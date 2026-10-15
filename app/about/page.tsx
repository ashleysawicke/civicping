// About: what CivicPing is, how it works, where data comes from.
export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          About CivicPing
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          CivicPing helps Ann Arbor residents follow City Council without
          reading hundred-page agendas. Most people don&apos;t have time to
          track every meeting — so CivicPing watches the agenda for you,
          surfaces the items relevant to your life, explains them in plain
          language, and tells you how to weigh in before the vote.
        </p>
      </div>

      <section aria-label="How it works" className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          How it works
        </h2>
        <ol className="space-y-3">
          {[
            ["We read the agenda", "Every council agenda is pulled from the city's official Legistar system as soon as it's published."],
            ["You tell us what matters", "Pick topics you care about and your ward. Your feed is ranked so the items relevant to you come first — and it tells you why each one matched."],
            ["Plain-language summaries", "Each item gets a human-verified summary with links to the official source. If an item hasn't been verified yet, we show the official title instead of guessing."],
            ["Take action", "Comment on the city's official page, draft an email to your representative, or sign up to speak. Nothing is ever submitted on your behalf."],
            ["See what happened", "After the meeting, outcomes come straight from the official minutes — we never infer how anyone voted."],
          ].map(([title, body], i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden="true"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-200"
              >
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-label="Data sources">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Where the data comes from
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          Agendas, votes, minutes, and documents come live from the City of
          Ann Arbor&apos;s Legistar system — the same official source the
          council itself uses. CivicPing is an independent project and is
          not affiliated with or endorsed by the City of Ann Arbor.
        </p>
      </section>

      <section aria-label="Privacy">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Privacy
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          Your topics and ward are stored only on your device, in your
          browser. There are no accounts, no tracking, and nothing about
          you is sent to any server.
        </p>
      </section>
    </div>
  );
}
