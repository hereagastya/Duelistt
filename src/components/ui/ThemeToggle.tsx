"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const KEY = "duelistt-theme";

/*
  Two states, one control, no dropdown. The icon shows what you would get by
  pressing it, not what you are currently in -- a switch labelled with its own
  current state is the oldest trap in this widget.
*/
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  // ThemeScript has already set the attribute; read it rather than guess, so
  // the button agrees with the page on the very first render after hydration.
  useEffect(() => {
    setTheme(
      document.documentElement.dataset.theme === "light" ? "light" : "dark",
    );
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private browsing. The theme still applies for this page's lifetime.
    }
  }

  const goingLight = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        goingLight ? "Switch to the light theme" : "Switch to the dark theme"
      }
      title={goingLight ? "Light theme" : "Dark theme"}
      className="press flex size-9 items-center justify-center rounded-lg border border-transparent text-ink-faint hover:border-rule hover:bg-paper-sunk hover:text-ink"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="size-[18px]"
      >
        {goingLight ? (
          <>
            <circle cx="10" cy="10" r="3.4" />
            <path d="M10 2.6v1.7M10 15.7v1.7M17.4 10h-1.7M4.3 10H2.6M15.2 4.8l-1.2 1.2M6 14l-1.2 1.2M15.2 15.2 14 14M6 6 4.8 4.8" />
          </>
        ) : (
          <path d="M16.2 11.8A6.6 6.6 0 0 1 8.2 3.8a6.6 6.6 0 1 0 8 8Z" />
        )}
      </svg>
    </button>
  );
}
