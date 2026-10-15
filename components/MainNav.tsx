// Main navigation links. Split so the active state (which needs usePathname)
// can stream inside Suspense while the static fallback prerenders cleanly.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Feed" },
  { href: "/meetings", label: "Meetings" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function NavLinks({ pathname }: { pathname: string | null }) {
  return (
    <nav
      aria-label="Main"
      className="border-t border-neutral-100 dark:border-neutral-900"
    >
      <ul className="flex px-2">
        {NAV.map((item) => {
          const active =
            pathname !== null &&
            (item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-[44px] items-center border-b-2 px-3 text-sm font-medium ${
                  active
                    ? "border-blue-700 text-neutral-900 dark:border-blue-400 dark:text-neutral-100"
                    : "border-transparent text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function MainNav() {
  const pathname = usePathname();
  return <NavLinks pathname={pathname} />;
}
