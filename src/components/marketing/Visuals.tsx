import { ChannelIcon } from "@/components/ui/ChannelIcon";
import type { Channel } from "@/lib/types";

/*
  These are not screenshots. They are drawn for the page: dark-native, so they
  sit in the composition instead of punching a white hole in it, and abstracted
  down to the one thing the product does -- a queue of people who have gone
  quiet, ordered by how long it has been.
*/

function Glow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -inset-x-8 -top-10 bottom-0 rounded-[3rem] bg-ember/[0.14] blur-[70px] ${className}`}
    />
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`panel relative rounded-2xl ${className}`}>{children}</div>
  );
}

type Row = {
  name: string;
  channel: Channel;
  label: string;
  meter: number;
  live?: boolean;
};

const QUEUE: Row[] = [
  { name: "Priya R.", channel: "email", label: "9d", meter: 92, live: true },
  { name: "Daniel O.", channel: "call", label: "4d", meter: 48 },
  { name: "Mei S.", channel: "linkedin", label: "2d", meter: 26 },
  { name: "Tomás H.", channel: "call", label: "today", meter: 8 },
];

/** The hero visual: the queue, as a shape rather than a UI. */
export function QueueVisual() {
  return (
    <div className="relative">
      <Glow />

      <Panel className="overflow-hidden p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2">
              <span className="pulse-soft absolute inline-flex size-2 rounded-full bg-ember" />
            </span>
            <span className="text-[11px] font-medium tracking-[0.16em] text-chalk-faint uppercase">
              Due today
            </span>
          </div>
          <span className="tnum rounded-full border border-ember/25 bg-ember/10 px-2.5 py-1 text-[12px] font-medium text-ember">
            4 waiting
          </span>
        </div>

        <div className="mt-5 space-y-1.5">
          {QUEUE.map((row, i) => (
            <div
              key={row.name}
              className={`rise flex items-center gap-3 rounded-xl px-3 py-3 ${
                row.live
                  ? "bg-ember/[0.07] ring-1 ring-ember/25"
                  : "bg-white/[0.02] ring-1 ring-white/[0.05]"
              }`}
              style={{ animationDelay: `${120 + i * 110}ms` }}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                  row.live
                    ? "bg-ember/15 text-ember"
                    : "bg-white/[0.05] text-chalk-faint"
                }`}
              >
                <ChannelIcon channel={row.channel} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium text-chalk">
                  {row.name}
                </span>
                {/* The bar is how long they have been waiting, not a progress meter. */}
                <span className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${row.meter}%`,
                      background: row.live
                        ? "linear-gradient(90deg, oklch(70% 0.15 62), oklch(80% 0.15 72))"
                        : "oklch(100% 0 0 / 0.18)",
                    }}
                  />
                </span>
              </span>

              <span
                className={`tnum shrink-0 text-[12px] ${
                  row.live ? "font-medium text-ember" : "text-chalk-faint"
                }`}
              >
                {row.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <span className="text-[12px] text-chalk-faint">
            Log it, pick a day, move on.
          </span>
          <span className="rounded-lg bg-ember px-3 py-1.5 text-[12px] font-medium text-night">
            Log a touch
          </span>
        </div>
      </Panel>
    </div>
  );
}

/** Step one: logging, drawn as the four decisions and nothing else. */
export function LogVisual() {
  const channels: { channel: Channel; label: string }[] = [
    { channel: "call", label: "Call" },
    { channel: "email", label: "Email" },
    { channel: "dm", label: "DM" },
    { channel: "linkedin", label: "LinkedIn" },
  ];

  return (
    <div className="relative">
      <Glow />

      <Panel className="overflow-hidden p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-chalk">Priya R.</span>
          <span className="text-[11px] font-medium tracking-[0.16em] text-chalk-faint uppercase">
            Log a touch
          </span>
        </div>

        {/* Decision one: which channel. Selected reads as a fill, not an outline. */}
        <div className="mt-5 flex flex-wrap gap-2">
          {channels.map(({ channel, label }) => {
            const on = channel === "call";
            return (
              <span
                key={channel}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] ${
                  on
                    ? "bg-ember text-night"
                    : "bg-white/[0.03] text-chalk-faint ring-1 ring-white/[0.06]"
                }`}
              >
                <ChannelIcon channel={channel} className="size-3.5" />
                {label}
              </span>
            );
          })}
        </div>

        {/* Decision two: what happened, in the words people actually use. */}
        <div className="mt-4 rounded-xl bg-white/[0.02] px-3.5 py-3 ring-1 ring-white/[0.05]">
          <p className="text-[13px] leading-[1.6] text-chalk-soft">
            Asked me to try again next week.
            <span className="ml-0.5 inline-block h-[15px] w-px translate-y-[3px] bg-ember" />
          </p>
        </div>

        {/* Decision three: when. This is the whole product in one row. */}
        <p className="mt-5 text-[11px] font-medium tracking-[0.16em] text-chalk-faint uppercase">
          Follow up in
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {["2 days", "1 week", "2 weeks", "1 month"].map((label) => {
            const on = label === "1 week";
            return (
              <span
                key={label}
                className={`tnum rounded-lg px-3 py-1.5 text-[12px] ${
                  on
                    ? "bg-ember/15 text-ember ring-1 ring-ember/35"
                    : "bg-white/[0.03] text-chalk-faint ring-1 ring-white/[0.06]"
                }`}
              >
                {label}
              </span>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-4">
          <span className="text-[12px] text-chalk-faint">
            Back on your list Mon 17.
          </span>
          <span className="rounded-lg bg-ember px-3 py-1.5 text-[12px] font-medium text-night">
            Save
          </span>
        </div>
      </Panel>
    </div>
  );
}

/** Step two: the nag, as an object rather than a screenshot of an inbox. */
export function DigestVisual() {
  return (
    <div className="relative">
      <Glow />

      <Panel className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-ember/15 text-ember">
            <ChannelIcon channel="email" className="size-3.5" />
          </span>
          <span className="text-[12px] text-chalk-soft">Duelistt</span>
          <span className="tnum ml-auto text-[12px] text-chalk-faint">
            07:00
          </span>
        </div>

        <div className="px-5 py-6 sm:px-7">
          <p className="text-[20px] font-semibold tracking-[-0.03em] text-chalk sm:text-[24px]">
            3 follow-ups due today
          </p>
          <p className="mt-1.5 text-[13px] text-chalk-faint">Oldest first.</p>

          <div className="mt-5 space-y-3">
            {QUEUE.slice(0, 3).map((row) => (
              <div key={row.name} className="flex items-baseline gap-3">
                <span className="text-[14px] font-medium text-chalk">
                  {row.name}
                </span>
                <span className="h-px flex-1 bg-white/[0.08]" />
                <span
                  className={`tnum text-[12px] ${row.live ? "text-ember" : "text-chalk-faint"}`}
                >
                  {row.label} late
                </span>
              </div>
            ))}
          </div>

          <span className="mt-7 inline-block rounded-lg bg-ember px-3.5 py-2 text-[13px] font-medium text-night">
            Open your list
          </span>
        </div>
      </Panel>
    </div>
  );
}

/** Step three: the reward. An empty queue, drawn as calm rather than absence. */
export function ClearedVisual() {
  return (
    <div className="relative">
      <Glow />

      <Panel className="overflow-hidden px-6 py-12 text-center sm:px-10">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-ember/12 ring-1 ring-ember/25">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
            className="size-6 text-ember"
          >
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>

        <p className="mt-6 text-[20px] font-semibold tracking-[-0.03em] text-chalk">
          Nothing due today.
        </p>
        <p className="mx-auto mt-2 max-w-[28ch] text-[14px] text-chalk-soft">
          Everyone is scheduled for later. Close the tab.
        </p>

        {/* The queue, emptied: rows fading out of view. */}
        <div className="mx-auto mt-8 max-w-[18rem] space-y-2">
          {[0.09, 0.06, 0.03].map((opacity, i) => (
            <div
              key={i}
              className="h-2 rounded-full"
              style={{ background: `oklch(100% 0 0 / ${opacity})` }}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

/**
  The wordmark's companion. A crossed-blades glyph read as a close button, so
  the mark is the queue instead: three rules shortening as the day clears,
  with the one that is due still lit.
*/
export function Mark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`flex size-7 items-center justify-center rounded-lg bg-ember/15 ring-1 ring-ember/30 ${className}`}
    >
      <svg viewBox="0 0 16 16" fill="none" className="size-4 text-ember">
        <path
          d="M3 4.25h10M3 8h6.5M3 11.75h3.5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12.5" cy="11.75" r="1.35" fill="currentColor" />
      </svg>
    </span>
  );
}
