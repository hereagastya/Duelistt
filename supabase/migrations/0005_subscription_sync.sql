-- Webhook deliveries are not ordered. Without a guard, a delayed
-- `subscription.past_due` that was emitted before a `subscription.active` can
-- land after it and lock out a paying customer. Every billing write is gated on
-- the event timestamp being at least as new as the last one applied.

alter table public.profiles
  add column subscription_synced_at timestamptz;

comment on column public.profiles.subscription_synced_at is
  'Timestamp of the most recent Dodo webhook event applied to this row. Billing '
  'writes are rejected when an event is older than this, so out-of-order '
  'deliveries cannot roll the subscription backwards.';
