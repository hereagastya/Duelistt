import { STATUS_LABELS, type ProspectStatus } from "@/lib/types";

// Text, not pills. A row of coloured badges turns a ledger into a dashboard,
// and status is the least important thing on any given line.
const TONE: Record<ProspectStatus, string> = {
  contacted: "text-ink-faint",
  replied: "text-accent-ink",
  won: "text-settled",
  lost: "text-ink-faint",
  cold: "text-ink-faint",
};

export function StatusTag({ status }: { status: ProspectStatus }) {
  return <span className={`text-[13px] ${TONE[status]}`}>{STATUS_LABELS[status]}</span>;
}
