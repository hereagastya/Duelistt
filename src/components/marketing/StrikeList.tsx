"use client";

import { useEffect, useRef, useState } from "react";

/*
  The words arrive intact, then a line is drawn through each one in turn, left
  to right, as if someone were crossing them off a list in front of you.

  This is a real strike being drawn, not `line-through` toggled on: the rule is
  an absolutely positioned bar that scales from zero width. It is the one effect
  on the page that is pure theatre, and it earns its place because the section's
  whole argument is "we decided not to build these".

  Hovering a word redraws its line, so the list stays alive after it has played.
*/
export function StrikeList({ items }: { items: string[] }) {
  const [struck, setStruck] = useState(0);
  const ref = useRef<HTMLUListElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStruck(items.length);
      return;
    }

    const timers: number[] = [];
    const observer = new IntersectionObserver(
      (records) => {
        if (!records[0]?.isIntersecting || started.current) return;
        started.current = true;
        observer.disconnect();

        items.forEach((_, i) => {
          timers.push(window.setTimeout(() => setStruck(i + 1), 260 + i * 130));
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [items]);

  return (
    <ul ref={ref} className="mt-9 flex max-w-[52rem] flex-wrap gap-x-7 gap-y-3">
      {items.map((item, i) => (
        <li
          key={item}
          className="group relative cursor-default text-[1.3rem] text-chalk-faint/70 transition-colors duration-300 hover:text-chalk-soft sm:text-[1.55rem]"
        >
          {item}
          <span
            aria-hidden
            className="absolute inset-x-0 top-1/2 h-[2px] origin-left rounded-full bg-ember/70 transition-transform duration-[450ms] ease-out group-hover:scale-x-100"
            style={{ transform: `scaleX(${i < struck ? 1 : 0})` }}
          />
        </li>
      ))}
    </ul>
  );
}
