-- The digest said "Priya Raman, 9 days late" and nothing else, so the follow-up
-- it prompted started from zero. The note was already in the database and
-- already in the queue; what was missing was the rest of the sentence around it:
-- which channel, how it went, and how long ago.
--
-- Both readers use the same LEFT JOIN LATERAL they always did, over the same
-- (prospect_id, touch_date desc, created_at desc) index. Widening the lateral's
-- select list costs nothing extra: the row is already being fetched.

-- The view -----------------------------------------------------------------
--
-- CREATE OR REPLACE only tolerates new columns appended after the existing
-- ones, so last_channel and last_outcome go at the end rather than beside
-- last_note where they read better. Replacing rather than dropping keeps the
-- view's grants, which is the point: a DROP would take the authenticated
-- SELECT with it and every list screen would start returning permission denied.

create or replace view public.prospect_list
with (security_invoker = on) as
select
  p.id,
  p.user_id,
  p.name,
  p.contact_info,
  p.channel,
  p.status,
  p.next_follow_up_date,
  p.created_at,
  p.updated_at,
  lt.note       as last_note,
  lt.touch_date as last_touch_date,
  lt.channel    as last_channel,
  lt.outcome    as last_outcome
from public.prospects p
left join lateral (
  select t.note, t.touch_date, t.channel, t.outcome
  from public.touches t
  where t.prospect_id = p.id
  order by t.touch_date desc, t.created_at desc
  limit 1
) lt on true;

-- The grant on this view is table-level, not column-level, so it already covers
-- the two new columns. Restated because a column-level grant here would have
-- silently excluded them, and the next person to read this should see which it
-- is without going back to 0004.
grant select on public.prospect_list to authenticated;

-- The digest queue ---------------------------------------------------------
--
-- Adding columns to a RETURNS TABLE changes the function's OUT parameters,
-- which CREATE OR REPLACE refuses, so both functions are dropped and rebuilt.
-- claim_digest goes first: it selects q.* from digest_queue and its own
-- declared row type has to match, column for column.
--
-- The bodies are string literals, so Postgres tracks no dependency between the
-- two and the drop order is ours to get right rather than its to enforce.

drop function if exists public.claim_digest(int);
drop function if exists public.digest_queue(int);

create function public.digest_queue(target_hour int default null)
returns table (
  user_id uuid,
  email text,
  timezone text,
  prospect_name text,
  next_follow_up_date date,
  days_overdue int,
  last_note text,
  last_channel public.channel,
  last_outcome public.touch_outcome,
  last_touch_date date
)
language sql
security definer
set search_path = ''
as $$
  select
    p.id,
    u.email::text,
    p.timezone,
    pr.name,
    pr.next_follow_up_date,
    (((now() at time zone p.timezone)::date - pr.next_follow_up_date))::int,
    lt.note,
    lt.channel,
    lt.outcome,
    lt.touch_date
  from public.profiles p
  join auth.users u on u.id = p.id
  join public.prospects pr on pr.user_id = p.id
  left join lateral (
    select t.note, t.channel, t.outcome, t.touch_date
    from public.touches t
    where t.prospect_id = pr.id
    order by t.touch_date desc, t.created_at desc
    limit 1
  ) lt on true
  where p.digest_enabled
    and u.email is not null
    and p.digest_hour = coalesce(target_hour, extract(hour from (now() at time zone p.timezone))::int)
    and pr.next_follow_up_date <= (now() at time zone p.timezone)::date
  order by p.id, pr.next_follow_up_date asc, pr.name asc;
$$;

create function public.claim_digest(target_hour int default null)
returns table (
  user_id uuid,
  email text,
  timezone text,
  prospect_name text,
  next_follow_up_date date,
  days_overdue int,
  last_note text,
  last_channel public.channel,
  last_outcome public.touch_outcome,
  last_touch_date date
)
language sql
security definer
set search_path = ''
as $$
  with claimed as (
    update public.profiles p
    set last_digest_sent_on = (now() at time zone p.timezone)::date
    where p.digest_enabled
      and p.digest_hour = coalesce(target_hour, extract(hour from (now() at time zone p.timezone))::int)
      -- Still the thing that makes a duplicate or overlapping run a no-op:
      -- one digest per user per local day, whatever hour they pick.
      and p.last_digest_sent_on is distinct from (now() at time zone p.timezone)::date
      and exists (
        select 1
        from public.prospects pr
        where pr.user_id = p.id
          and pr.next_follow_up_date <= (now() at time zone p.timezone)::date
      )
    returning p.id
  )
  select q.*
  from public.digest_queue(target_hour) q
  join claimed c on c.id = q.user_id;
$$;

-- DROP took the grants with it. Both read across every user and digest_queue
-- touches auth.users, so leaving the default PUBLIC grant in place would
-- publish them at /rest/v1/rpc/.
revoke execute on function public.digest_queue(int) from public, anon, authenticated;
revoke execute on function public.claim_digest(int) from public, anon, authenticated;
grant  execute on function public.digest_queue(int) to service_role;
grant  execute on function public.claim_digest(int) to service_role;
