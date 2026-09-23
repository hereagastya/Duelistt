import { ChannelIcon } from "@/components/ui/ChannelIcon";
import { digestHtml, type DigestRow } from "@/lib/email/digest";
import type { Channel } from "@/lib/types";

/*
  The product shots are built from the app's own classes and tokens rather than
  captured as images: they stay crisp at any size and cannot go stale against a
  PNG. They deliberately stay light -- that is what the app actually looks like,
  and a dark mock of a UI that does not exist would be a lie in a screenshot.
*/

function Window({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-paper text-ink ring-1 ring-black/40 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
      {children}
    </div>
  );
}

function AppChrome() {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-rule bg-paper/85 px-4 py-2.5">
      <div className="flex items-center gap-1">
        <span className="mr-3 text-[14px] font-semibold tracking-[-0.025em] text-ink">
          Duelistt
        </span>
        <span className="relative rounded-md px-2 py-1 text-[13px] font-medium text-ink">
          Today
          <span
            aria-hidden
            className="absolute inset-x-2 -bottom-[11px] h-[2px] rounded-full bg-accent"
          />
        </span>
        <span className="rounded-md px-2 py-1 text-[13px] text-ink-soft">All prospects</span>
        <span className="rounded-md px-2 py-1 text-[13px] text-ink-soft">Settings</span>
      </div>
      <span className="text-[12px] text-ink-faint">Sign out</span>
    </div>
  );
}

const TODAY_ROWS: { name: string; channel: Channel; note: string; late: string; overdue: number }[] =
  [
    {
      name: "Priya Raman",
      channel: "email",
      note: "Sent the pricing one-pager, no reply yet",
      late: "9 days late",
      overdue: 9,
    },
    {
      name: "Daniel Okafor",
      channel: "call",
      note: "Left a voicemail, said to try Tuesday morning",
      late: "4 days late",
      overdue: 4,
    },
    {
      name: "Mei Sun",
      channel: "linkedin",
      note: "Warm intro from Raj, asked to reconnect in a month",
      late: "2 days late",
      overdue: 2,
    },
    {
      name: "Tomás Herrera",
      channel: "call",
      note: "Asked me to ring back after standup",
      late: "Due today",
      overdue: 0,
    },
  ];

export function TodayMock() {
  return (
    <Window>
      <AppChrome />
      <div className="px-5 pt-6 pb-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="flex items-baseline gap-2.5 text-[21px] leading-tight font-semibold tracking-[-0.03em] text-ink">
              Today
              <span className="tnum text-[14px] font-normal text-ink-faint">4</span>
            </h3>
            <p className="mt-1 text-[13px] text-ink-soft">
              Oldest first. Click anyone to log what happened.
            </p>
          </div>
          <span className="inline-flex h-8 items-center rounded-md bg-accent px-3 text-[13px] font-medium text-ink shadow-xs">
            Add prospect
          </span>
        </div>

        <ul className="mt-4">
          {TODAY_ROWS.map((row, i) => (
            <li
              key={row.name}
              className={`flex items-center gap-3 rounded-lg px-2 py-2.5 ${
                i === 0 ? "bg-paper-sunk" : ""
              }`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
                  i === 0 ? "bg-surface text-accent-ink" : "bg-paper-sunk text-ink-faint"
                }`}
              >
                <ChannelIcon channel={row.channel} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-medium text-ink">{row.name}</span>
                <span className="mt-0.5 block truncate text-[12px] text-ink-soft">{row.note}</span>
              </span>
              <span
                className={`tnum shrink-0 rounded-full px-2 py-0.5 text-[12px] whitespace-nowrap ${
                  row.overdue >= 7
                    ? "bg-late/10 font-medium text-late"
                    : row.overdue > 0
                      ? "text-ink-soft"
                      : "text-ink-faint"
                }`}
              >
                {row.late}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

export function EmptyTodayMock() {
  return (
    <Window>
      <AppChrome />
      <div className="px-5 pt-6 pb-8">
        <h3 className="text-[21px] leading-tight font-semibold tracking-[-0.03em] text-ink">
          Today
        </h3>
        <div className="mt-5 rounded-xl border border-rule bg-surface px-6 py-12 text-center shadow-xs">
          <p className="text-[15px] font-medium text-ink">Nothing due today.</p>
          <p className="mx-auto mt-1.5 max-w-[34ch] text-[13px] text-ink-soft">
            Everyone you are tracking is scheduled for later. Close the tab.
          </p>
        </div>
      </div>
    </Window>
  );
}

function MockField({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-ink">{label}</span>
        {hint && <span className="text-[11px] text-ink-faint">{hint}</span>}
      </div>
      <div className="truncate rounded-md border border-rule-strong bg-surface px-3 py-2 text-[13px] text-ink shadow-xs">
        {value}
      </div>
    </div>
  );
}

export function LogTouchMock() {
  return (
    <div className="overflow-hidden rounded-xl bg-surface text-ink ring-1 ring-black/40 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
      <div className="px-6 pt-5 pb-4">
        <p className="text-[16px] font-semibold tracking-[-0.02em] text-ink">Log a touch</p>
        <p className="mt-0.5 text-[13px] text-ink-soft">Daniel Okafor</p>
      </div>

      <div className="flex flex-col gap-4 border-t border-rule px-6 py-5">
        <div className="flex gap-3">
          <MockField label="Date" value="Today" />
          <MockField label="Channel" value="Call" />
        </div>
        <MockField label="What happened" value="Left voicemail" />
        <MockField label="Note" value="Said to try Tuesday morning" hint="Optional" />

        <div className="border-t border-rule pt-4">
          <p className="mb-2.5 text-[13px] font-medium text-ink">Then</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex h-8 items-center rounded-md border border-accent bg-accent px-2.5 text-[13px] font-medium text-ink shadow-xs">
              Follow up
            </span>
            {["Replied", "Cold", "Won", "Lost"].map((label) => (
              <span
                key={label}
                className="inline-flex h-8 items-center rounded-md border border-rule-strong bg-surface px-2.5 text-[13px] font-medium text-ink-soft shadow-xs"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex h-8 items-center rounded-md border border-rule-strong bg-surface px-2.5 text-[13px] font-medium text-ink-soft shadow-xs">
              Tomorrow
            </span>
            <span className="inline-flex h-8 items-center rounded-md border border-accent-line bg-accent-wash px-2.5 text-[13px] font-medium text-ink">
              In 3 days
            </span>
            <span className="inline-flex h-8 items-center rounded-md border border-rule-strong bg-surface px-2.5 text-[13px] font-medium text-ink-soft shadow-xs">
              In a week
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-rule bg-paper px-6 py-4">
        <span className="inline-flex h-9 items-center rounded-md px-3.5 text-[14px] font-medium text-ink-soft">
          Cancel
        </span>
        <span className="inline-flex h-9 items-center rounded-md bg-accent px-3.5 text-[14px] font-medium text-ink shadow-xs">
          Save touch
        </span>
      </div>
    </div>
  );
}

const DIGEST_SAMPLE: DigestRow[] = [
  {
    user_id: "preview",
    email: "you@example.com",
    timezone: "UTC",
    prospect_name: "Priya Raman",
    next_follow_up_date: "2026-01-01",
    days_overdue: 9,
    last_note: "Sent the pricing one-pager, no reply yet",
  },
  {
    user_id: "preview",
    email: "you@example.com",
    timezone: "UTC",
    prospect_name: "Daniel Okafor",
    next_follow_up_date: "2026-01-06",
    days_overdue: 4,
    last_note: "Left a voicemail, said to try Tuesday morning",
  },
  {
    user_id: "preview",
    email: "you@example.com",
    timezone: "UTC",
    prospect_name: "Tomás Herrera",
    next_follow_up_date: "2026-01-10",
    days_overdue: 0,
    last_note: "Asked me to ring back after standup",
  },
];

/**
 * Rendered from the very template the digest is sent with, so the page cannot
 * drift from the real email. Sandboxed and isolated in a frame because it is a
 * whole HTML document with its own styles.
 */
export function DigestPreview() {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-black/40 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center gap-3 border-b border-night-rule bg-night-raised px-5 py-3 text-[12px]">
        <span className="text-chalk-faint">From</span>
        <span className="truncate text-chalk-soft">Duelistt &lt;digest@mail.duelistt.com&gt;</span>
        <span className="ml-auto shrink-0 text-chalk-faint">07:00</span>
      </div>
      <iframe
        title="The daily digest email"
        sandbox=""
        loading="lazy"
        srcDoc={digestHtml(DIGEST_SAMPLE, "https://www.duelistt.com/today")}
        className="h-[520px] w-full border-0 bg-white sm:h-[480px]"
      />
    </div>
  );
}
