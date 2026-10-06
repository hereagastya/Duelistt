-- Did a signup ever actually start, and how long did it take them?
--
-- The other end of the funnel from retention.sql. That one asks whether people
-- are still logging in week 2; this one asks whether they got off the ground at
-- all. A signup that never creates a prospect never saw the product work, and
-- no amount of digest email will save it.
--
-- Two different first moments, because they mean different things:
--
--   * first prospect  -- they put a real name in. Intent.
--   * first touch     -- they logged something that happened. The actual
--                        product loop. Add Prospect writes an initial touch,
--                        so in practice these are usually seconds apart; a gap
--                        between them means someone added names and then never
--                        came back to log anything.
--
-- Same exclusions as retention.sql. Keep the two lists in step.
--
--   psql "$DATABASE_URL" -f supabase/queries/activation.sql

with signups as (
  select
    u.id,
    u.email,
    u.created_at as signed_up_at,
    coalesce(u.raw_app_meta_data ->> 'provider', 'email') as provider
  from auth.users u
  where u.email not like '%@duelistt.test'
    and u.email not like '%+%@%'
),

firsts as (
  select
    s.id,
    s.email,
    s.provider,
    s.signed_up_at,
    (select min(p.created_at) from public.prospects p where p.user_id = s.id) as first_prospect_at,
    (select min(t.created_at) from public.touches   t where t.user_id = s.id) as first_touch_at,
    (select count(*)          from public.prospects p where p.user_id = s.id) as prospects,
    (select count(*)          from public.touches   t where t.user_id = s.id) as touches
  from signups s
)

select
  email,
  provider,
  signed_up_at::date as signed_up,

  (first_prospect_at is not null) as added_a_prospect,
  (first_touch_at is not null) as logged_a_touch,

  -- Rounded to the minute: the question is "same sitting or a day later", not
  -- milliseconds.
  case when first_prospect_at is not null
    then round(extract(epoch from (first_prospect_at - signed_up_at)) / 60.0)
  end as mins_to_first_prospect,
  case when first_touch_at is not null
    then round(extract(epoch from (first_touch_at - signed_up_at)) / 60.0)
  end as mins_to_first_touch,

  prospects,
  touches,

  case
    when first_prospect_at is null then 'never activated'
    when first_touch_at is null then 'added a name, logged nothing'
    when first_touch_at - signed_up_at < interval '1 hour' then 'activated in the first hour'
    when first_touch_at - signed_up_at < interval '1 day' then 'activated same day'
    else 'came back later to start'
  end as verdict
from firsts
order by signed_up_at;
