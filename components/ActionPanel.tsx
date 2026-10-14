
// ActionPanel: honest handoffs to the city's official systems. Each action
// is labeled as opening or drafting — nothing is ever submitted on the
// resident's behalf from this app.
"use client";

import { useEffect, useState } from "react";
import type { AgendaItem, MeetingSummary } from "@/lib/types";
import { loadPrefs } from "@/lib/preferences";
import { isUpcoming } from "@/components/format";
import { CITY_CONTACT_URL, CLERK_PHONE } from "@/lib/wards";

function telHref(phone: string): string {
  return `tel:+1${phone.replace(/\D/g, "")}`;
}

export default function ActionPanel({
  item,
  meeting,
}: {
  item: AgendaItem;
  meeting: MeetingSummary;
}) {
  const [ward, setWard] = useState<number | null>(null);

  useEffect(() => {
    setWard(loadPrefs().ward);
  }, []);

  const upcoming = isUpcoming(meeting.date);

  const subject = `Agenda item ${item.agendaNumber ?? ""}: ${item.title}`.trim();
  const wardLine =
    ward != null
      ? `As a Ward ${ward} resident, `
      : "As an Ann Arbor resident, ";
  const body =
    `Dear Councilmembers,\n\n${wardLine}I am writing about the following agenda item:\n\n` +
    `"${item.title}"${item.agendaNumber ? ` (${item.agendaNumber})` : ""}\n\n` +
    `[Write your comments here]\n\nThank you,\n[Your name]`;
  const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <section aria-label="Take action" className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Take action
      </h2>
      <div className="mt-2 space-y-3">
        {upcoming && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <a
              href={meeting.insiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-700 px-4 font-medium text-white"
            >
              Comment on the city&apos;s official page
            </a>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Opens the city&apos;s Legistar page — eComment opens with the
              published agenda and closes at 4 p.m. on meeting day. Your
              comment is submitted on the city&apos;s site, not here.
            </p>
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <a
            href={mailto}
            className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-700 px-4 font-medium text-white"
          >
            Draft an email to Council
          </a>
          <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
            Drafts a message in your own mail app — review and send it
            yourself. Nothing is sent from this app.
          </p>
          <a
            href={CITY_CONTACT_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
          >
            Find your representatives&apos; email addresses in the city
            directory
          </a>
        </div>

        {upcoming && (
          <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <a
              href={telHref(CLERK_PHONE)}
              className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-700 px-4 font-medium text-white"
            >
              Call the Clerk&apos;s Office ({CLERK_PHONE})
            </a>
            <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
              Opens your phone app to call {CLERK_PHONE} between 8 a.m.–5 p.m.
              on meeting day to sign up for public comment. You speak to the
              city directly — nothing is scheduled from here.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
