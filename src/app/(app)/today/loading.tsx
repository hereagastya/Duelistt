// Rendered the instant a navigation starts, so a click has visible feedback
// while the queue query runs. Mirrors the real layout to avoid a jump when the
// rows arrive.
export default function Loading() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="flex items-baseline justify-between gap-4 pt-10 pb-5">
        <div className="h-[22px] w-24 rounded-sm bg-paper-sunk" />
        <div className="h-[15px] w-24 rounded-sm bg-paper-sunk" />
      </div>

      <ul className="border-t border-rule">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-baseline gap-4 border-b border-rule py-3.5">
            <div className="size-4 shrink-0 translate-y-[3px] rounded-sm bg-paper-sunk" />
            <div className="min-w-0 flex-1">
              <div className="h-[15px] w-44 max-w-full rounded-sm bg-paper-sunk" />
              <div className="mt-2 h-[13px] w-72 max-w-full rounded-sm bg-rule" />
            </div>
            <div className="h-[13px] w-16 shrink-0 rounded-sm bg-paper-sunk" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading today&rsquo;s follow-ups</span>
    </div>
  );
}
