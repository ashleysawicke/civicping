// Breadcrumb trail: Home / Meeting / Item. The last crumb is the current page.
import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex min-h-[44px] flex-wrap items-center gap-1 text-sm">
        {items.map((crumb, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && (
                <span aria-hidden="true" className="text-neutral-400 dark:text-neutral-500">
                  /
                </span>
              )}
              {last || !crumb.href ? (
                <span
                  aria-current={last ? "page" : undefined}
                  className="font-medium text-neutral-700 dark:text-neutral-300"
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="inline-flex min-h-[44px] items-center font-medium text-blue-700 underline dark:text-blue-400"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
