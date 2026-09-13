-- Profiles: per-user settings, billing state, and digest preferences.
-- auth.users cannot be extended directly, so every durable user fact lives here.

create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'cancelled', 'expired'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- Billing. A single tier exists today; `plan` is present so later tiers
  -- do not require a migration.
  plan text not null default 'standard',
  subscription_status public.subscription_status not null default 'trialing',
  trial_ends_at timestamptz not null default (now() + interval '7 days'),
  dodo_customer_id text,
  dodo_subscription_id text,

  -- Preferences.
  timezone text not null default 'UTC',
  default_follow_up_interval smallint not null default 3
    constraint default_follow_up_interval_sane check (default_follow_up_interval between 1 and 365),
  digest_enabled boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.profiles.timezone is
  'IANA timezone name. Validated by trigger: an invalid value would raise inside the '
  'digest query''s AT TIME ZONE and abort the run for every user, not just this one.';

-- An invalid timezone string is not a per-row problem. `now() at time zone 'garbage'`
-- raises, which would kill the whole hourly digest query. Reject it at write time.
create or replace function public.validate_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not exists (select 1 from pg_catalog.pg_timezone_names where name = new.timezone) then
    raise exception 'invalid IANA timezone: %', new.timezone
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function public.validate_timezone();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Every new auth user gets a profile, and therefore a trial, atomically at signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- These are SECURITY DEFINER / trigger-only functions living in the API-exposed
-- `public` schema, so PostgREST publishes them at /rest/v1/rpc/<name>. Triggers
-- do not consult EXECUTE privileges, so revoking costs nothing and removes a
-- definer-rights function from the anon-reachable surface.
-- (Flagged by the Supabase security advisor, lint 0028/0029.)
revoke execute on function public.handle_new_user()   from public, anon, authenticated;
revoke execute on function public.validate_timezone() from public, anon, authenticated;
revoke execute on function public.set_updated_at()    from public, anon, authenticated;
