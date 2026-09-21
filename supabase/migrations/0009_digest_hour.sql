-- Per-user digest hour.
--
-- The hour was hardcoded to 7 in the caller, which meant every user was sent
-- their digest at 7am local. It now lives next to the timezone, on the profile.
--
-- The functions keep their `target_hour` parameter, but its meaning changes: it
-- is no longer "the hour to send at", it is an override used for testing and
-- replay. When null (the normal hourly run) each user is matched against their
-- OWN digest_hour; when given, it matches everyone who chose that hour, which
-- is what a manual ?hour= replay wants.

alter table public.profiles
  add column digest_hour smallint not null default 7
    constraint digest_hour_range check (digest_hour between 0 and 23);

comment on column public.profiles.digest_hour is
  'Local hour (0-23) at which this user receives the daily digest. Compared '
  'against the hour in their own timezone, so it means 07:00 where they are.';

-- Column-level grants are how billing columns stay out of reach; the new
-- preference has to be added explicitly or Settings gets permission denied.
grant update (digest_hour) on public.profiles to authenticated;

create or replace function public.digest_queue(target_hour int default null)
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
    and p.digest_hour = coalesce(target_hour, extract(hour from (now() at time zone p.timezone))::int)
    and pr.next_follow_up_date <= (now() at time zone p.timezone)::date
  order by p.id, pr.next_follow_up_date asc, pr.name asc;
$$;

create or replace function public.claim_digest(target_hour int default null)
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
  with claimed as (
    update public.profiles p
    set last_digest_sent_on = (now() at time zone p.timezone)::date
    where p.digest_enabled
      and p.digest_hour = coalesce(target_hour, extract(hour from (now() at time zone p.timezone))::int)
      -- Unchanged, and still the thing that makes a duplicate or overlapping
      -- run a no-op: one digest per user per local day, whatever hour they pick.
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

revoke execute on function public.digest_queue(int)  from public, anon, authenticated;
revoke execute on function public.claim_digest(int)  from public, anon, authenticated;
grant  execute on function public.digest_queue(int)  to service_role;
grant  execute on function public.claim_digest(int)  to service_role;
