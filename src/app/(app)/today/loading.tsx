// Rendered the instant a navigation starts, so a click has visible feedback
// while the queue query runs. Mirrors the real layout to avoid a jump when the
// rows arrive.
export default function Loading() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="flex items-center justify-between gap-4 pt-9 pb-5">
        <div>
          <div className="h-[24px] w-24 rounded-md bg-paper-sunk" />
          <div className="mt-2 h-[14px] w-56 rounded-md bg-paper-sunk" />
        </div>
        <div className="h-8 w-28 rounded-md bg-paper-sunk" />
      </div>

      <ul className="-mx-3">
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-3">
            <div className="size-8 shrink-0 rounded-md bg-paper-sunk" />
            <div className="min-w-0 flex-1">
              <div className="h-[15px] w-44 max-w-full rounded-md bg-paper-sunk" />
              <div className="mt-2 h-[13px] w-72 max-w-full rounded-md bg-rule" />
            </div>
            <div className="h-[20px] w-20 shrink-0 rounded-full bg-paper-sunk" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading today&rsquo;s follow-ups</span>
    </div>
  );
}
