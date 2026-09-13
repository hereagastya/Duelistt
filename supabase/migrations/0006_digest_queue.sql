-- One query per hour for the whole digest run.
--
-- The timezone predicate cannot be expressed through PostgREST, and doing it in
-- application code would mean a query per user. `now() at time zone p.timezone`
-- is evaluated once per PROFILE row -- a scan of a small table -- and the join
-- into prospects is indexed. Users with nothing due fall out of the join, which
-- is what gives "never send an empty digest" for free.
--
-- The live AT TIME ZONE beats a precomputed digest_hour_utc column because
-- Postgres applies DST from the tz database; a stored UTC hour silently drifts
-- an hour twice a year for every user outside the tropics.

create or replace function public.digest_queue(target_hour int default 7)
returns table (
  user_id uuid,
  email text,
  timezone text,
  prospect_name text,
  next_follow_up_date date,
  days_overdue int,
  last_note text
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
    lt.note
  from public.profiles p
  join auth.users u on u.id = p.id
  join public.prospects pr on pr.user_id = p.id
  left join lateral (
    select t.note
    from public.touches t
    where t.prospect_id = pr.id
    order by t.touch_date desc, t.created_at desc
    limit 1
  ) lt on true
  where p.digest_enabled
    and u.email is not null
    and extract(hour from (now() at time zone p.timezone))::int = target_hour
    and pr.next_follow_up_date <= (now() at time zone p.timezone)::date
  order by p.id, pr.next_follow_up_date asc, pr.name asc;
$$;

-- Reads across every user and touches auth.users, so it is service-role only.
-- Leaving the default PUBLIC grant would publish it at /rest/v1/rpc/digest_queue.
revoke execute on function public.digest_queue(int) from public, anon, authenticated;
grant execute on function public.digest_queue(int) to service_role;
