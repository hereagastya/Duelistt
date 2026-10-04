"use client";

import { useEffect, useRef, useState } from "react";

/*
  The ledger is the one place on the page where motion is the argument rather
  than decoration.

  It plays once when it scrolls into view: the logged lines arrive quickly, the
  empty days arrive slowly and one at a time, and the gaps get slower as they
  go. By the last one you are waiting for it, which is the point. A static list
  of dashes says "there were some empty days"; this makes you sit through them.
*/

export type Entry = { line: string | null };

export function Ledger({ entries }: { entries: Entry[] }) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLOListElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const instant = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (instant) {
      setShown(entries.length);
      return;
    }

    const timers: number[] = [];

    const observer = new IntersectionObserver(
      (records) => {
        if (!records[0]?.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        // A logged day lands straight away. An empty one takes longer than the
        // one before it, so the pauses stretch exactly the way they did.
        // Fast enough that nobody scrolling past meets an empty box, slow
        // enough that the stretching is still felt. The whole run is under 2s.
        let at = 120;
        let emptyRun = 0;

        entries.forEach((e, i) => {
          if (e.line) {
            emptyRun = 0;
            at += 150;
          } else {
            emptyRun += 1;
            at += 160 + emptyRun * 70;
          }
          timers.push(window.setTimeout(() => setShown(i + 1), at));
        });
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [entries]);

  return (
    <ol ref={ref}>
      {entries.map((entry, i) => {
        const visible = i < shown;
        return (
          <li
            key={i}
            className={`flex items-baseline gap-5 py-3.5 transition-[opacity,transform] duration-500 ease-out ${
              i !== entries.length - 1 ? "border-b border-white/[0.06]" : ""
            } ${visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
          >
            {/* A gutter mark instead of a date: a logged day is lit, a silent
                one is a hairline. No invented calendar. */}
            <span
              aria-hidden
              className={`mt-[0.45rem] h-px w-5 shrink-0 rounded-full transition-colors duration-500 ${
                entry.line ? "bg-ember/80" : "bg-white/[0.12]"
              }`}
            />

            {entry.line ? (
              <span className="text-[15px] text-chalk-soft sm:text-[16px]">
                {entry.line}
              </span>
            ) : (
              <span
                aria-label="nothing logged"
                className="text-[15px] text-white/[0.14]"
              >
                &mdash;
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
