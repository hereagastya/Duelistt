"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { signOut } from "@/app/(auth)/actions";

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/prospects", label: "All prospects" },
  { href: "/settings", label: "Settings" },
] as const;

export function Nav({ email }: { email: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[48rem] items-center justify-between gap-6 px-6 py-3">
        <nav className="flex items-center gap-1">
          <Link
            href="/today"
            className="mr-3 text-[15px] font-semibold tracking-[-0.025em] text-ink"
          >
            Duelistt
          </Link>

          {LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-md px-2.5 py-1.5 text-[14px] transition-colors duration-150 ${
                  active ? "font-medium text-ink" : "text-ink-soft hover:bg-paper-sunk hover:text-ink"
                }`}
              >
                {label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2.5 -bottom-[13px] h-[2px] rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <form action={signOut}>
          <button
            type="submit"
            title={email}
            className="rounded-md px-2 py-1.5 text-[13px] text-ink-faint transition-colors duration-150 hover:bg-paper-sunk hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
