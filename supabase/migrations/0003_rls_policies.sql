-- Row Level Security on all three tables. Nothing is left to application filtering.
--
-- auth.uid() is wrapped in (select ...) throughout so Postgres evaluates it once
-- per statement as an InitPlan, not once per row.

alter table public.profiles  enable row level security;
alter table public.prospects enable row level security;
alter table public.touches   enable row level security;

-- Profiles ------------------------------------------------------------------
-- No INSERT policy: rows are created by the on_auth_user_created trigger.
-- No DELETE policy: profiles die with the auth user, via cascade.

create policy profiles_select_own on public.profiles
  for select to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- RLS is row-level, not column-level. Without the grants below, the policy above
-- happily allows `update profiles set subscription_status = 'active'` -- a user
-- writing themselves a free subscription. Billing columns are writable only by
-- the service role (the Dodo webhook).
revoke update on public.profiles from authenticated;
grant update (timezone, default_follow_up_interval, digest_enabled)
  on public.profiles to authenticated;

-- Prospects -----------------------------------------------------------------

create policy prospects_select_own on public.prospects
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy prospects_insert_own on public.prospects
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy prospects_update_own on public.prospects
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy prospects_delete_own on public.prospects
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Touches -------------------------------------------------------------------
-- `user_id = auth.uid()` alone is NOT sufficient here. It would permit inserting
-- a row with your own user_id but another user's prospect_id -- writing into a
-- stranger's touch history. Ownership of the parent prospect is checked too.

create policy touches_select_own on public.touches
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy touches_insert_own on public.touches
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.prospects p
      where p.id = prospect_id
        and p.user_id = (select auth.uid())
    )
  );

create policy touches_update_own on public.touches
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.prospects p
      where p.id = prospect_id
        and p.user_id = (select auth.uid())
    )
  );

create policy touches_delete_own on public.touches
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- Explicit grants ------------------------------------------------------------
-- Supabase's default privileges on `public` would cover most of this, but
-- relying on them makes the migration silently wrong anywhere else and hides
-- what `authenticated` can actually reach. RLS still filters every row below.

grant select                         on public.profiles  to authenticated;
grant select, insert, update, delete on public.prospects to authenticated;
grant select, insert, update, delete on public.touches   to authenticated;
