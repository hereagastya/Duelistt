"use client";

import { useEffect, useState } from "react";

/*
  One word in the badge, swapping between the channels people actually work in.
  It is doing a job: the line "for cold calls, emails, DMs and LinkedIn" reads
  as a feature list, while one word changing reads as "yes, yours too".

  Reserved width via a hidden copy of the longest word, so the pill does not
  twitch wider and narrower every two seconds.
*/
export function Cycler({
  words,
  interval = 2200,
}: {
  words: string[];
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setOn(false);
      window.setTimeout(() => {
        setI((n) => (n + 1) % words.length);
        setOn(true);
      }, 180);
    }, interval);

    return () => window.clearInterval(id);
  }, [words.length, interval]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), "");

  return (
    // Centred in the reserved box, not left-aligned: a trailing gap after a
    // short word read as a typo in a centred badge.
    <span className="relative inline-grid place-items-center">
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {longest}
      </span>
      <span
        className="col-start-1 row-start-1 text-chalk transition-[opacity,transform] duration-200 ease-out"
        style={{
          opacity: on ? 1 : 0,
          transform: on ? "none" : "translateY(-4px)",
        }}
      >
        {words[i]}
      </span>
    </span>
  );
}
