// The detail page runs two queries plus generateMetadata, so it is the most
// likely place to see a pause. This keeps the header and history in place while
// they resolve.
export default function Loading() {
  return (
    <div className="motion-safe:animate-pulse">
      <div className="pt-10 pb-6">
        <div className="h-[13px] w-28 rounded-sm bg-paper-sunk" />
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="h-[22px] w-52 max-w-full rounded-sm bg-paper-sunk" />
            <div className="mt-2 h-[14px] w-64 max-w-full rounded-sm bg-rule" />
          </div>
          <div className="h-[36px] w-32 rounded-sm bg-paper-sunk" />
        </div>
      </div>

      <div className="flex flex-wrap gap-x-10 gap-y-3 border-y border-rule py-4">
        {[0, 1, 2].map((i) => (
          <div key={i}>
            <div className="h-[13px] w-20 rounded-sm bg-rule" />
            <div className="mt-1.5 h-[13px] w-24 rounded-sm bg-paper-sunk" />
          </div>
        ))}
      </div>

      <div className="mt-8 mb-3 h-[15px] w-20 rounded-sm bg-paper-sunk" />

      <ol className="border-t border-rule">
        {[0, 1].map((i) => (
          <li key={i} className="flex gap-4 border-b border-rule py-3.5">
            <div className="h-[13px] w-[4.5rem] shrink-0 rounded-sm bg-paper-sunk" />
            <div className="mt-[3px] size-4 shrink-0 rounded-sm bg-paper-sunk" />
            <div className="min-w-0 flex-1">
              <div className="h-[14px] w-32 rounded-sm bg-paper-sunk" />
              <div className="mt-2 h-[14px] w-72 max-w-full rounded-sm bg-rule" />
            </div>
          </li>
        ))}
      </ol>

      <span className="sr-only">Loading this prospect</span>
    </div>
  );
}
