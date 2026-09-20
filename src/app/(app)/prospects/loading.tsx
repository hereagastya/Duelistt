// Mirrors the list layout, including the filter row, so the page does not jump
// when the real controls and rows arrive.
export default function Loading() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="flex items-baseline justify-between gap-4 pt-10 pb-5">
        <div className="h-[22px] w-36 rounded-sm bg-paper-sunk" />
        <div className="h-[15px] w-24 rounded-sm bg-paper-sunk" />
      </div>

      <div className="flex flex-col gap-3 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="h-[34px] min-w-[11rem] max-w-[20rem] flex-1 rounded-sm border border-rule bg-paper-sunk" />
          <div className="h-[34px] w-[9.5rem] rounded-sm border border-rule bg-paper-sunk" />
          <div className="h-[34px] w-[9.5rem] rounded-sm border border-rule bg-paper-sunk" />
        </div>
        <div className="h-[13px] w-24 rounded-sm bg-paper-sunk" />
      </div>

      <ul className="border-t border-rule">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="flex items-baseline gap-4 border-b border-rule py-3.5">
            <div className="size-4 shrink-0 translate-y-[3px] rounded-sm bg-paper-sunk" />
            <div className="min-w-0 flex-1">
              <div className="h-[15px] w-40 max-w-full rounded-sm bg-paper-sunk" />
              <div className="mt-2 h-[13px] w-64 max-w-full rounded-sm bg-rule" />
            </div>
            <div className="h-[13px] w-16 shrink-0 rounded-sm bg-paper-sunk" />
            <div className="h-[13px] w-[6.5rem] shrink-0 rounded-sm bg-paper-sunk" />
          </li>
        ))}
      </ul>

      <span className="sr-only">Loading your prospects</span>
    </div>
  );
}
