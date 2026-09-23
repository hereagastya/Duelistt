// Mirrors the list layout, including the filter row, so the page does not jump
// when the real controls and rows arrive.
export default function Loading() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="flex items-center justify-between gap-4 pt-9 pb-5">
        <div className="h-[24px] w-40 rounded-md bg-paper-sunk" />
        <div className="h-8 w-28 rounded-md bg-paper-sunk" />
      </div>

      <div className="flex flex-col gap-3 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-9 min-w-[11rem] max-w-[20rem] flex-1 rounded-md border border-rule bg-paper-sunk" />
          <div className="h-9 w-[9.5rem] rounded-md border border-rule bg-paper-sunk" />
          <div className="h-9 w-[9.5rem] rounded-md border border-rule bg-paper-sunk" />
        </div>
        <div className="h-[13px] w-24 rounded-md bg-paper-sunk" />
      </div>

      <ul className="-mx-3">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="flex items-center gap-3 px-3 py-3">
            <div className="size-8 shrink-0 rounded-md bg-paper-sunk" />
            <div className="min-w-0 flex-1">
              <div className="h-[15px] w-40 max-w-full rounded-md bg-paper-sunk" />
              <div className="mt-2 h-[13px] w-64 max-w-full rounded-md bg-rule" />
            </div>
            <div className="h-[13px] w-[6.5rem] shrink-0 rounded-md bg-paper-sunk" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading your prospects</span>
    </div>
  );
}
