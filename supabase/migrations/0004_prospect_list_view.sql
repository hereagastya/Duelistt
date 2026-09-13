-- Every list screen wants the prospect plus the note from its most recent touch.
-- A view with a LATERAL join gets that in one query; fetching touches per row in
-- application code would be an N+1 against the one screen opened most often.
--
-- security_invoker = on is load-bearing: without it the view runs as its owner
-- and silently bypasses RLS on both underlying tables.

create view public.prospect_list
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
  lt.touch_date as last_touch_date
from public.prospects p
left join lateral (
  select t.note, t.touch_date
  from public.touches t
  where t.prospect_id = p.id
  order by t.touch_date desc, t.created_at desc
  limit 1
) lt on true;

-- The view is a separate object with its own privileges; security_invoker means
-- the underlying tables' RLS still applies to whoever selects from it.
grant select on public.prospect_list to authenticated;
