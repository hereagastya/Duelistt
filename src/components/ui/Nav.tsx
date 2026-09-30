"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";
import { Logo } from "@/components/marketing/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

// `short` is what a phone gets: at 390px "All prospects" wrapped the whole bar
// onto two lines, and a nav that reflows is a nav that looks broken.
const LINKS = [
  { href: "/today", label: "Today", short: "Today" },
  { href: "/prospects", label: "All prospects", short: "Prospects" },
  { href: "/settings", label: "Settings", short: "Settings" },
] as const;

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[48rem] flex-nowrap items-center justify-between gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <nav className="flex min-w-0 items-center gap-0.5 sm:gap-1">
          <Link
            href="/today"
            className="press mr-1.5 flex shrink-0 items-center gap-2 text-[15px] font-semibold tracking-[-0.025em] text-ink sm:mr-3"
          >
            <Logo size={24} />
            <span className="hidden sm:inline">Duelistt</span>
          </Link>

          {LINKS.map(({ href, label, short }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`press relative shrink-0 rounded-md px-2 py-1.5 text-[14px] whitespace-nowrap sm:px-2.5 ${
                  active
                    ? "font-medium text-ink"
                    : "text-ink-soft hover:bg-paper-sunk hover:text-ink"
                }`}
              >
                <span className="sm:hidden">{short}</span>
                <span className="hidden sm:inline">{label}</span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-[13px] h-[2px] rounded-full bg-accent sm:inset-x-2.5"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggle />
          <form action={signOut}>
            <button
              type="submit"
              title={email}
              aria-label="Sign out"
              className="press flex size-9 items-center justify-center rounded-md text-[13px] text-ink-faint hover:bg-paper-sunk hover:text-ink sm:size-auto sm:px-2.5 sm:py-1.5"
            >
              <span className="hidden sm:inline">Sign out</span>
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="size-[18px] sm:hidden"
              >
                <path d="M12.5 6.5V4.8a1.3 1.3 0 0 0-1.3-1.3H4.8a1.3 1.3 0 0 0-1.3 1.3v10.4a1.3 1.3 0 0 0 1.3 1.3h6.4a1.3 1.3 0 0 0 1.3-1.3v-1.7M8 10h8.5m0 0-2.4-2.4M16.5 10l-2.4 2.4" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
