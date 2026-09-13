import type { Channel } from "@/lib/types";

// Authored at one stroke weight (1.4) on a 16 grid. No emoji, no icon font --
// the five channels are the only glyphs this product needs.
const PATHS: Record<Channel, React.ReactNode> = {
  email: (
    <>
      <rect x="1.75" y="3.5" width="12.5" height="9" rx="1.25" />
      <path d="M2.5 4.75 8 8.75l5.5-4" />
    </>
  ),
  call: <path d="M3.4 2.5h2.3l1.15 2.9-1.4 1a8.2 8.2 0 0 0 3.15 3.15l1-1.4 2.9 1.15v2.3a1 1 0 0 1-1.1 1A11.2 11.2 0 0 1 2.4 3.6a1 1 0 0 1 1-1.1Z" />,
  dm: <path d="M13.25 9.5a1.5 1.5 0 0 1-1.5 1.5H5.5L2.75 13.5V4a1.5 1.5 0 0 1 1.5-1.5h7.5a1.5 1.5 0 0 1 1.5 1.5Z" />,
  linkedin: (
    <>
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
      <path d="M5 7v4M5 4.9v.1M8 11V7m0 1.6c.2-1 .9-1.6 1.7-1.6 1 0 1.3.8 1.3 1.9V11" />
    </>
  ),
  other: (
    <>
      <circle cx="8" cy="8" r="5.75" />
      <path d="M8 5.4v3.2M8 10.6v.1" />
    </>
  ),
};

export function ChannelIcon({ channel, className = "" }: { channel: Channel; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={`size-4 shrink-0 ${className}`}
    >
      {PATHS[channel]}
    </svg>
  );
}
