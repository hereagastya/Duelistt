// Mirrors supabase/migrations. Regenerate with:
//   supabase gen types typescript --linked > src/lib/database.types.ts
// and re-export from here once the project is linked.

export const CHANNELS = ["email", "call", "dm", "linkedin", "other"] as const;
export type Channel = (typeof CHANNELS)[number];

export const PROSPECT_STATUSES = ["contacted", "replied", "cold", "won", "lost"] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

export const TOUCH_OUTCOMES = [
  "no_answer",
  "answered_not_interested",
  "answered_interested",
  "callback_requested",
  "voicemail",
  "sent",
  "replied",
  "no_reply",
  "other",
] as const;
export type TouchOutcome = (typeof TOUCH_OUTCOMES)[number];

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

export const CHANNEL_LABELS: Record<Channel, string> = {
  email: "Email",
  call: "Call",
  dm: "DM",
  linkedin: "LinkedIn",
  other: "Other",
};

export const STATUS_LABELS: Record<ProspectStatus, string> = {
  contacted: "Contacted",
  replied: "Replied",
  cold: "Cold",
  won: "Won",
  lost: "Lost",
};

export const OUTCOME_LABELS: Record<TouchOutcome, string> = {
  no_answer: "No answer",
  answered_not_interested: "Answered — not interested",
  answered_interested: "Answered — interested",
  callback_requested: "Callback requested",
  voicemail: "Left voicemail",
  sent: "Sent",
  replied: "They replied",
  no_reply: "No reply",
  other: "Other",
};

// Outcomes worth offering first for a given channel. The full list stays
// available; this only decides ordering, so logging a call does not start
// by asking about email.
export const OUTCOMES_BY_CHANNEL: Record<Channel, readonly TouchOutcome[]> = {
  call: ["no_answer", "voicemail", "answered_interested", "answered_not_interested", "callback_requested"],
  email: ["sent", "replied", "no_reply"],
  dm: ["sent", "replied", "no_reply"],
  linkedin: ["sent", "replied", "no_reply"],
  other: ["sent", "replied", "no_reply"],
};

export type Prospect = {
  id: string;
  user_id: string;
  name: string;
  contact_info: string;
  channel: Channel;
  status: ProspectStatus;
  next_follow_up_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Touch = {
  id: string;
  prospect_id: string;
  user_id: string;
  touch_date: string;
  channel: Channel;
  outcome: TouchOutcome;
  note: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  plan: string;
  subscription_status: SubscriptionStatus;
  trial_ends_at: string;
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  timezone: string;
  default_follow_up_interval: number;
  digest_enabled: boolean;
  /** Local hour, 0-23, at which this user's digest is sent. */
  digest_hour: number;
  created_at: string;
  updated_at: string;
};

// A Today-view row: the prospect plus the note from its most recent touch.
export type DueProspect = Prospect & {
  last_note: string | null;
  last_touch_date: string | null;
};
