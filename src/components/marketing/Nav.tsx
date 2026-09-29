"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Logo } from "./Logo";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
] as const;

/*
  The one intentional glass surface on the page: a pill that floats over the
  content rather than sitting on it. Over the hero it is nearly weightless; once
  you scroll past it, it tightens and darkens so it stays readable over panels.
*/
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that survives a rotation into the desktop layout is a menu that
  // traps the page behind an invisible panel.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const close = () => setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, []);

  return (
    <div className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
      <header
        className={`glass-nav relative mx-auto flex w-full items-center justify-between rounded-full py-2.5 pr-2.5 pl-3 transition-[max-width,background-color] duration-300 ease-out ${
          scrolled ? "max-w-[58rem] is-scrolled" : "max-w-[64rem]"
        }`}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-full transition-opacity duration-150 hover:opacity-85"
        >
          <Logo size={30} />
          <span className="text-[15px] font-semibold tracking-[-0.03em]">
            Duelistt
          </span>
        </Link>

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-3.5 py-2 text-[14px] text-chalk-soft transition-colors duration-150 hover:bg-white/[0.06] hover:text-chalk"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/login"
            className="hidden rounded-full px-3.5 py-2 text-[14px] text-chalk-soft transition-colors duration-150 hover:bg-white/[0.06] hover:text-chalk sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ember px-4 py-2 text-[14px] font-medium text-night transition-colors duration-150 hover:bg-ember-deep"
          >
            Start free trial
          </Link>

          <button
            type="button"
            aria-expanded={open}
            aria-controls="nav-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="ml-0.5 flex size-9 items-center justify-center rounded-full text-chalk-soft transition-colors duration-150 hover:bg-white/[0.06] hover:text-chalk md:hidden"
          >
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              aria-hidden
              className="size-5"
            >
              {open ? (
                <path d="m5.5 5.5 9 9M14.5 5.5l-9 9" />
              ) : (
                <path d="M4 6.5h12M4 13.5h12" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div
            id="nav-menu"
            className="glass-nav absolute top-[calc(100%+0.6rem)] right-0 left-0 rounded-2xl p-2 md:hidden"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3.5 py-3 text-[15px] text-chalk-soft transition-colors duration-150 hover:bg-white/[0.06] hover:text-chalk"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/login"
              className="block rounded-xl px-3.5 py-3 text-[15px] text-chalk-soft transition-colors duration-150 hover:bg-white/[0.06] hover:text-chalk sm:hidden"
            >
              Sign in
            </a>
          </div>
        )}
      </header>
    </div>
  );
}
