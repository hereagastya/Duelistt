-- The whole domain: two tables. Deliberately flat.
-- No deal value, no pipeline stage, no tags, no custom fields. See PRODUCT.md.

create type public.channel as enum ('email', 'call', 'dm', 'linkedin', 'other');

-- Five stored values. `new` was dropped as unreachable (Add Prospect always writes
-- an initial touch) and `follow_up_due` as derived -- "due" is computed from
-- next_follow_up_date, so the date stays the single source of truth.
create type public.prospect_status as enum ('contacted', 'replied', 'cold', 'won', 'lost');

create type public.touch_outcome as enum (
  'no_answer', 'answered_not_interested', 'answered_interested',
  'callback_requested', 'voicemail', 'sent', 'replied', 'no_reply', 'other'
);

create table public.prospects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  name text not null
    constraint prospects_name_not_blank check (length(btrim(name)) > 0),
  contact_info text not null
    constraint prospects_contact_info_not_blank check (length(btrim(contact_info)) > 0),

  channel public.channel not null,
  status public.prospect_status not null default 'contacted',
  next_follow_up_date date,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.touches (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references public.prospects (id) on delete cascade,
  -- Denormalised from prospects so RLS and the digest query never need a join.
  user_id uuid not null references auth.users (id) on delete cascade,

  touch_date date not null default current_date,
  channel public.channel not null,
  -- Required on every touch. Nothing reads this yet; the v2 week-over-week
  -- comparison depends on it existing on historical rows, and history
  -- cannot be backfilled.
  outcome public.touch_outcome not null,
  note text,

  created_at timestamptz not null default now()
);

create trigger prospects_set_updated_at
  before update on public.prospects
  for each row execute function public.set_updated_at();

-- Indexes -------------------------------------------------------------------

-- The Today view: due follow-ups for one user, oldest first. Partial, because
-- rows with no scheduled follow-up are the majority and never appear here.
create index prospects_due_idx
  on public.prospects (user_id, next_follow_up_date)
  where next_follow_up_date is not null;

-- The full list view, filtered by status.
create index prospects_user_status_idx on public.prospects (user_id, status);

-- Covers both the RLS predicate and the unindexed-FK scan on user cascade delete.
create index touches_user_id_idx on public.touches (user_id);

-- Prospect detail: touch history, reverse chronological.
create index touches_prospect_history_idx
  on public.touches (prospect_id, touch_date desc, created_at desc);
