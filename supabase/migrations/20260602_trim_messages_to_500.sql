-- 20260602_trim_messages_to_500.sql
-- Keep only the newest 500 chat messages so the table size stays bounded
-- (protects Supabase free-tier DB size). Applied once to the Supabase project
-- via the SQL editor or `supabase db push`.
--
-- This migration also removes an earlier 100-message cap that existed only
-- in the Supabase dashboard (trigger messages_trim_after_insert calling
-- trim_messages_to_100), so the 500-message cap below is the single cap.

-- Remove the previous 100-message cap, if present.
drop trigger if exists messages_trim_after_insert on public.messages;
drop function if exists public.trim_messages_to_100();

-- Function: delete everything older than the newest 500 messages.
create or replace function public.trim_messages()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.messages
  where id <= (
    select id from public.messages
    order by id desc
    offset 500 limit 1
  );
  return null;
end;
$$;

-- Trigger: run the trim once per insert statement (cheap, batch-safe).
drop trigger if exists trim_messages_after_insert on public.messages;
create trigger trim_messages_after_insert
after insert on public.messages
for each statement
execute function public.trim_messages();

-- One-time trim of any existing backlog so the cap applies immediately
-- (the trigger alone would only take effect on the next insert).
delete from public.messages
where id <= (
  select id from public.messages
  order by id desc
  offset 500 limit 1
);
