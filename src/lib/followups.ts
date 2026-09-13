import { addDays, todayIn } from "@/lib/date";

/**
 * Quick-pick follow-up dates, anchored to the user's own default interval.
 * Lives outside the "use server" module: every export of one of those must be
 * an async server action, and this is a pure function both sides need.
 */
export function followUpPresets(timezone: string, defaultInterval: number) {
  const today = todayIn(timezone);
  const seen = new Set<number>();

  return [
    { label: "Tomorrow", days: 1 },
    { label: `In ${defaultInterval} days`, days: defaultInterval },
    { label: "In a week", days: 7 },
  ]
    // Drop the duplicate when the user's default is itself 1 or 7.
    .filter((o) => (seen.has(o.days) ? false : (seen.add(o.days), true)))
    .map((o) => ({ ...o, date: addDays(today, o.days) }));
}
