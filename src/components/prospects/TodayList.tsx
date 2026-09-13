"use client";

import Link from "next/link";
import { useState } from "react";

import { LogTouchModal } from "@/components/touches/LogTouchModal";
import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { daysBetween, overdueLabel } from "@/lib/date";
import { CHANNEL_LABELS, type DueProspect } from "@/lib/types";

type Props = {
  prospects: DueProspect[];
  today: string;
  timezone: string;
  defaultInterval: number;
};

export function TodayList({ prospects, today, timezone, defaultInterval }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = prospects.find((p) => p.id === openId) ?? null;

  return (
    <>
      <ul className="border-t border-rule">
        {prospects.map((p) => {
          const late = p.next_follow_up_date ? daysBetween(p.next_follow_up_date, today) : 0;

          return (
            <li key={p.id} className="border-b border-rule">
              <div className="group flex items-baseline gap-4 py-3.5">
                <button
                  type="button"
                  onClick={() => setOpenId(p.id)}
                  className="flex min-w-0 flex-1 items-baseline gap-3 text-left"
                >
                  <ChannelIcon
                    channel={p.channel}
                    className="translate-y-[3px] text-ink-faint transition-colors duration-150 group-hover:text-accent"
                  />

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium text-ink">
                      {p.name}
                    </span>
                    {p.last_note ? (
                      <span className="mt-0.5 block truncate text-[13px] text-ink-soft">
                        {p.last_note}
                      </span>
                    ) : (
                      <span className="mt-0.5 block text-[13px] text-ink-faint">
                        {CHANNEL_LABELS[p.channel]} &middot; {p.contact_info}
                      </span>
                    )}
                  </span>
                </button>

                <span
                  className={`tnum shrink-0 text-[13px] ${
                    late >= 7 ? "font-medium text-late" : late > 0 ? "text-ink-soft" : "text-ink-faint"
                  }`}
                >
                  {overdueLabel(late)}
                </span>

                <Link
                  href={`/prospects/${p.id}`}
                  className="shrink-0 text-[13px] text-ink-faint opacity-0 transition-opacity duration-150 hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
                >
                  Open
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {open && (
        <LogTouchModal
          open
          onClose={() => setOpenId(null)}
          prospect={{ id: open.id, name: open.name, channel: open.channel }}
          today={today}
          timezone={timezone}
          defaultInterval={defaultInterval}
        />
      )}
    </>
  );
}
