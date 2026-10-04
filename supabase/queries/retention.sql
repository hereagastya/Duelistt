-- Per-user logging activity by week since signup.
--
-- The question this answers: do people keep logging touches after the novelty
-- of day one, or does the queue go stale? Week 2 is the one that matters. A
-- user who logs nothing in week 2 has stopped using the product, whatever
-- their subscription says.
--
-- Run with the service role (the Supabase SQL editor, or the MCP tool). It
-- reads auth.users, so it is not reachable from the client.
--
--   psql "$DATABASE_URL" -f supabase/queries/retention.sql
--
-- Two deliberate choices:
--
--   * It counts touches.created_at, NOT touch_date. touch_date is what the
--     user says happened and can be backdated; created_at is when they
--     actually opened the app and typed. Only the second one measures usage.
--
--   * A week that has not finished yet comes back NULL rather than 0, because
--     "they logged nothing in week 2" and "week 2 has not happened" are
--     different findings and a zero hides the difference.

with signups as (
  select
    u.id,
    u.email,
    u.created_at as signed_up_at,
    coalesce(u.raw_app_meta_data ->> 'provider', 'email') as provider
  from auth.users u
  -- Test accounts. Extend this list rather than eyeballing the output.
  where u.email not like '%@duelistt.test'
    and u.email not like '%+%@%'
),

counted as (
  select
    s.id,
    s.email,
    s.provider,
    s.signed_up_at,
    floor(extract(epoch from (now() - s.signed_up_at)) / 86400)::int as days_since_signup,
    count(t.id) filter (
      where t.created_at >= s.signed_up_at
        and t.created_at < s.signed_up_at + interval '7 days'
    ) as wk1,
    count(t.id) filter (
      where t.created_at >= s.signed_up_at + interval '7 days'
        and t.created_at < s.signed_up_at + interval '14 days'
    ) as wk2,
    count(t.id) filter (
      where t.created_at >= s.signed_up_at + interval '14 days'
        and t.created_at < s.signed_up_at + interval '21 days'
    ) as wk3,
    count(t.id) as touches_total,
    max(t.created_at) as last_touch_at
  from signups s
  left join public.touches t on t.user_id = s.id
  group by s.id, s.email, s.provider, s.signed_up_at
)

select
  email,
  provider,
  signed_up_at::date as signed_up,
  days_since_signup,
  wk1,
  case when days_since_signup >= 14 then wk2 end as wk2,
  case when days_since_signup >= 21 then wk3 end as wk3,
  touches_total,
  last_touch_at::date as last_touch,
  case
    when touches_total = 0 then 'never started'
    when days_since_signup >= 14 and wk2 = 0 then 'dropped after week 1'
    when days_since_signup >= 14 and wk2 > 0 then 'still logging'
    else 'too early to say'
  end as verdict
from counted
order by signed_up_at;
