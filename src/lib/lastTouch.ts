import { daysBetween, todayIn } from "@/lib/date";
import {
  CHANNEL_LABELS,
  OUTCOME_LABELS,
  type Channel,
  type TouchOutcome,
} from "@/lib/types";

/*
  "Priya Raman, 9 days late" tells you to call, and nothing about what to say.
  The line built here is the rest of the sentence: how you reached them, how it
  went, what they said, and how long ago. It is the difference between a
  follow-up that continues a conversation and one that opens with "just
  checking in".

  Shared by the digest email and the Today queue so the two never drift. The
  module is deliberately free of server-only imports: the queue renders it in a
  client component.
*/

/** The four columns the lateral join adds to prospect_list and digest_queue. */
export type LastTouchColumns = {
  last_note: string | null;
  last_channel: Channel | null;
  last_outcome: TouchOutcome | null;
  last_touch_date: string | null;
};

export type LastTouch = {
  channel: string;
  outcome: string;
  /** Collapsed and truncated, ready to display. Null when the touch had no note. */
  note: string | null;
  when: string;
};

/*
  A note is a free-text field with no length limit, and a subject line's worth
  of it is all that fits on one line of an email on a phone. Long enough to
  carry "asked for pricing, call thursday"; short enough that one rambling note
  cannot push the next name off the screen.
*/
const NOTE_LIMIT = 120;

function truncateNote(note: string): string {
  // Newlines inside a note would break both the single-line layout and the
  // plain-text list, so whitespace collapses before anything else happens.
  const flat = note.trim().replace(/\s+/g, " ");
  if (flat.length <= NOTE_LIMIT) return flat;

  // Cut at the last word boundary inside the limit, unless that would throw
  // away most of the line, which happens when the note is one long token.
  const cut = flat.slice(0, NOTE_LIMIT);
  const space = cut.lastIndexOf(" ");
  const body = space > NOTE_LIMIT - 30 ? cut.slice(0, space) : cut;
  return `${body.trimEnd()}\u2026`;
}

function whenLabel(touchDate: string, timezone: string): string {
  const days = daysBetween(touchDate, todayIn(timezone));
  // A backdated touch can only ever be in the past, but a clock skewed across
  // midnight could produce -1, and "in 1 day" would be nonsense.
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

/** The last touch in display terms, or null when this person has no history. */
export function lastTouch(
  row: LastTouchColumns,
  timezone: string,
): LastTouch | null {
  // channel and outcome are NOT NULL on touches, so null here means the lateral
  // matched nothing at all. Testing last_note instead would hide the line for
  // every touch somebody logged without typing one, which is most of them.
  if (!row.last_channel || !row.last_outcome || !row.last_touch_date) {
    return null;
  }

  return {
    channel: CHANNEL_LABELS[row.last_channel],
    outcome: OUTCOME_LABELS[row.last_outcome],
    note: row.last_note?.trim() ? truncateNote(row.last_note) : null,
    when: whenLabel(row.last_touch_date, timezone),
  };
}

/**
 * "Call · No answer · “asked for pricing, call thursday” · 3 days ago".
 *
 * The note is passed separately rather than read off `touch`, so the HTML
 * renderer can hand in an escaped copy and escaping stays at the boundary
 * where the output format is actually known. Pass null to drop the note.
 */
export function lastTouchLine(touch: LastTouch, note: string | null): string {
  return [
    touch.channel,
    touch.outcome,
    note === null ? null : `\u201c${note}\u201d`,
    touch.when,
  ]
    .filter((part): part is string => part !== null)
    .join(" \u00b7 ");
}
