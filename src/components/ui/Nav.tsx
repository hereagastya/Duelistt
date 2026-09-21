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
    <header className="border-b border-rule">
      <div className="mx-auto flex w-full max-w-[46rem] items-center justify-between gap-6 px-6 py-4">
        <nav className="flex items-baseline gap-5">
          <Link href="/today" className="text-[15px] font-semibold tracking-[-0.02em] text-ink">
            Duelistt
          </Link>
          <span className="h-4 w-px bg-rule" aria-hidden />
          {LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`text-[14px] transition-colors duration-150 ${
                  active
                    ? "font-medium text-ink underline decoration-accent decoration-2 underline-offset-[6px]"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <form action={signOut}>
          <button
            type="submit"
            title={email}
            className="text-[13px] text-ink-faint transition-colors duration-150 hover:text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
