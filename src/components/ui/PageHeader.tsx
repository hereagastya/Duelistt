import type { ReactNode } from "react";

/** One rhythm for every screen: the title, an optional count, one action. */
export function PageHeader({
  title,
  count,
  action,
  description,
}: {
  title: string;
  count?: number;
  action?: ReactNode;
  description?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-9 pb-5">
      <div className="min-w-0">
        <h1 className="flex items-baseline gap-2.5 text-[24px] leading-tight font-semibold tracking-[-0.03em] text-ink">
          {title}
          {count !== undefined && count > 0 && (
            <span className="tnum text-[15px] font-normal text-ink-faint">{count}</span>
          )}
        </h1>
        {description && <p className="mt-1.5 text-[14px] text-ink-soft">{description}</p>}
      </div>
      {action}
    </div>
  );
}
