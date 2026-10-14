// Shared loading / error / empty states used across pages.
import type { ReactNode } from "react";

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-2 h-4 w-16 rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="mb-2 h-5 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
      <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
    </div>
  );
}

export function ErrorBox({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
      <p className="font-semibold text-red-800 dark:text-red-200">{title}</p>
      <p className="mt-1 text-sm text-red-700 dark:text-red-300">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-[44px] items-center rounded-lg bg-red-700 px-4 font-medium text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyNotice({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center dark:border-neutral-800 dark:bg-neutral-900">
      <p className="font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </p>
      {children && (
        <div className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
          {children}
        </div>
      )}
    </div>
  );
}
