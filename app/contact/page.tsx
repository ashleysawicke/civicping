// Contact: how to report issues or share ideas.
export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          Contact
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          Spotted a mistake in a summary, or have an idea for CivicPing?
          We&apos;d love to hear it.
        </p>
      </div>

      <section
        aria-label="Give feedback"
        className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Give feedback
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          The fastest way is to open an issue on the project&apos;s GitHub
          repository — it&apos;s public, and every report is read.
        </p>
        <a
          href="https://github.com/ashleysawicke/civicping/issues"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex min-h-[44px] items-center rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white"
        >
          Report an issue on GitHub
        </a>
      </section>

      <section aria-label="Official city business">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Official city business
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          CivicPing can&apos;t take official comments or speak to the
          council for you. To comment on an agenda item, use the
          “Take action” section on any item page — it links straight to
          the city&apos;s official channels.
        </p>
      </section>
    </div>
  );
}
