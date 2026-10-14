
// Matter timeline: the same matter's appearances and actions across meetings,
// plus official facts and attachments. Loads on demand from the API.
"use client";

import { useEffect, useState } from "react";
import type { MatterDetail, MatterRef } from "@/lib/types";
import { formatShortDate, formatCost } from "@/components/format";

export default function MatterTimeline({ matter }: { matter: MatterRef }) {
  const [detail, setDetail] = useState<MatterDetail | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/matters/${matter.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("matter unavailable");
        const data = await res.json();
        if (!cancelled) setDetail(data.matter as MatterDetail);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [matter.id]);

  return (
    <section aria-label="Matter record" className="mt-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Matter record
      </h2>
      <div className="mt-2 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {matter.file} · {matter.type}
        </p>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Status: {matter.status}
        </p>
        {failed && (
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            Full record could not be loaded.
          </p>
        )}
        {!failed && detail === null && (
          <div className="mt-2 animate-pulse space-y-2" aria-label="Loading matter record">
            <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
            <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
          </div>
        )}
        {detail && (
          <div className="mt-3 space-y-3">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {detail.enactmentNumber && (
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Enactment
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {detail.enactmentNumber}
                  </dd>
                </div>
              )}
              {detail.requester && (
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Requester
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {detail.requester}
                  </dd>
                </div>
              )}
              {detail.cost != null && (
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Cost
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatCost(detail.cost)}
                  </dd>
                </div>
              )}
              {detail.passedDate && (
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">
                    Passed
                  </dt>
                  <dd className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatShortDate(detail.passedDate)}
                  </dd>
                </div>
              )}
            </dl>

            {detail.history.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Timeline
                </h3>
                <ol className="mt-2 space-y-2">
                  {detail.history.map((h, i) => (
                    <li
                      key={`${h.eventId}-${i}`}
                      className="flex items-start justify-between gap-2 rounded-lg bg-neutral-50 px-3 py-2 text-sm dark:bg-neutral-800"
                    >
                      <span className="text-neutral-900 dark:text-neutral-100">
                        {formatShortDate(h.eventDate)}
                        {h.agendaNumber ? ` · ${h.agendaNumber}` : ""}
                        {h.actionName ? ` — ${h.actionName}` : ""}
                      </span>
                      {h.passed === true && (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                          Passed
                        </span>
                      )}
                      {h.passed === false && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                          Did not pass
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {detail.attachments.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
                  Attachments
                </h3>
                <ul className="mt-2 space-y-1">
                  {detail.attachments.map((a) => (
                    <li key={a.url}>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-700 underline dark:text-blue-400"
                      >
                        {a.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
