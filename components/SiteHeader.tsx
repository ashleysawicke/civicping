// Site header: brand left, help (?) and settings (gear) right.
"use client";

import { useState } from "react";
import Link from "next/link";
import HelpModal from "./HelpModal";

export default function SiteHeader() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/95 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/95">
        <div className="flex min-h-[52px] items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center"
            aria-label="CivicPing home"
          >
            <span className="text-lg font-bold tracking-tight">CivicPing</span>
            <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
              Ann Arbor City Council
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              aria-label="What is CivicPing? Help"
              title="What is CivicPing?"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300"
            >
              <span
                aria-hidden="true"
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-current text-sm font-bold"
              >
                ?
              </span>
            </button>
            <Link
              href="/settings"
              aria-label="Settings"
              title="Settings"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-xl text-neutral-600 dark:text-neutral-300"
            >
              <span aria-hidden="true">⚙</span>
            </Link>
          </div>
        </div>
      </header>
      {helpOpen && <HelpModal onClose={() => setHelpOpen(false)} />}
    </>
  );
}
