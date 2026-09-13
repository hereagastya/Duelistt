// All follow-up dates are plain calendar dates (`date` in Postgres, `YYYY-MM-DD`
// as a string). They are never timestamps, so they must never be parsed with
// `new Date("2026-09-09")` -- that reads as UTC midnight and shifts a day
// backwards for anyone west of Greenwich.

/** Today's calendar date in the given IANA timezone, as `YYYY-MM-DD`. */
export function todayIn(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Whole days between two `YYYY-MM-DD` dates. Positive when `to` is later. */
export function daysBetween(from: string, to: string): number {
  const MS_PER_DAY = 86_400_000;
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / MS_PER_DAY);
}

/** `YYYY-MM-DD`, `days` after the given date. */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/**
 * How late a follow-up is, in the user's own words.
 * Negative days never reach here: the Today view only shows due-or-overdue rows.
 */
export function overdueLabel(daysOverdue: number): string {
  if (daysOverdue <= 0) return "Due today";
  if (daysOverdue === 1) return "1 day late";
  return `${daysOverdue} days late`;
}

/** `9 Sep` / `9 Sep 2025` -- the year only when it is not the current one. */
export function formatDate(date: string, timezone: string): string {
  const currentYear = todayIn(timezone).slice(0, 4);
  const showYear = date.slice(0, 4) !== currentYear;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...(showYear ? { year: "numeric" } : {}),
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
