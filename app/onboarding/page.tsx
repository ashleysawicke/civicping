// Onboarding: pick topics + ward so the feed can be ranked. Stored on-device.
"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import PreferencesForm from "@/components/PreferencesForm";

export default function OnboardingPage() {
  const router = useRouter();

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

      <PreferencesForm
        saveLabel="Save and see my feed"
        intro="Pick the topics you care about and your ward. Items matching them will be ranked to the top of your feed, with a note explaining why."
        onSaved={() => router.push("/")}
      />

      <Link
        href="/"
        className="inline-flex min-h-[44px] w-full items-center justify-center text-sm font-medium text-neutral-500 underline dark:text-neutral-400"
      >
        Skip for now
      </Link>
    </div>
  );
}
