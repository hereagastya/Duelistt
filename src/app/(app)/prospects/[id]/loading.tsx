// The detail page runs two queries plus generateMetadata, so it is the most
// likely place to see a pause. This keeps the header and history in place while
// they resolve.
export default function Loading() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="pt-8 pb-6">
        <div className="h-[13px] w-28 rounded-md bg-paper-sunk" />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-[26px] w-52 max-w-full rounded-md bg-paper-sunk" />
            <div className="mt-3 h-[14px] w-64 max-w-full rounded-md bg-rule" />
          </div>
          <div className="h-9 w-32 rounded-md bg-paper-sunk" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface px-4 py-3.5">
            <div className="h-[12px] w-20 rounded-md bg-rule" />
            <div className="mt-2 h-[13px] w-24 rounded-md bg-paper-sunk" />
          </div>
        ))}
      </div>

      <div className="mt-9 mb-2 h-[15px] w-20 rounded-md bg-paper-sunk" />

      <ol>
        {[0, 1].map((i) => (
          <li key={i} className="flex gap-4 py-3.5">
            <div className="h-[13px] w-[4.5rem] shrink-0 rounded-md bg-paper-sunk" />
            <div className="size-6 shrink-0 rounded-md bg-paper-sunk" />
            <div className="min-w-0 flex-1">
              <div className="h-[14px] w-32 rounded-md bg-paper-sunk" />
              <div className="mt-2 h-[14px] w-72 max-w-full rounded-md bg-rule" />
            </div>
          </li>
        ))}
      </ol>

      <span className="sr-only">Loading this prospect</span>
    </div>
  );
}
