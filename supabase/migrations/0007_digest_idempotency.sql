-- Scheduled runs can be delivered more than once (Vercel documents this; any
-- external scheduler has the same property). Without a guard, a duplicate
-- invocation emails every recipient twice.
--
-- claim_digest() marks each recipient as sent for their LOCAL today inside the
-- same UPDATE that selects them. Under READ COMMITTED a concurrent second call
-- blocks on the row locks, re-checks the WHERE clause once the first commits,
-- finds last_digest_sent_on already equal to today, and claims nobody.

alter table public.profiles
  add column last_digest_sent_on date;

comment on column public.profiles.last_digest_sent_on is
  'The user''s local calendar date on which a digest was last claimed for sending. '
  'Makes the hourly digest idempotent against duplicate or overlapping runs.';

create or replace function public.claim_digest(target_hour int default 7)
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
      and extract(hour from (now() at time zone p.timezone))::int = target_hour
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

-- A claimed user whose batch failed to send has not been emailed. Releasing the
-- claim lets a replay (?hour=) reach them today instead of silently skipping.
create or replace function public.release_digest_claim(user_ids uuid[])
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set last_digest_sent_on = null
  where id = any(user_ids);
$$;

revoke execute on function public.claim_digest(int)            from public, anon, authenticated;
revoke execute on function public.release_digest_claim(uuid[]) from public, anon, authenticated;
grant  execute on function public.claim_digest(int)            to service_role;
grant  execute on function public.release_digest_claim(uuid[]) to service_role;
