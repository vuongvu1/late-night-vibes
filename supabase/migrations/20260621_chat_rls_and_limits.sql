-- 20260621_chat_rls_and_limits.sql
-- Lock down the anonymous chat. The browser ships the public anon key, so any
-- visitor can call the REST/Realtime API directly — the UI is not a security
-- boundary. This migration enables RLS on public.messages and grants ONLY the
-- operations the app performs: read all messages, insert size-bounded ones.
-- No UPDATE/DELETE for anon/authenticated, so a client wielding the anon key
-- cannot edit or wipe the chat, and overlong/empty messages are rejected
-- server-side.
--
-- NOT auto-applied. Apply via the Supabase SQL editor or `supabase db push`,
-- exactly like 20260602_trim_messages_to_500.sql.
--
-- !! INSPECT FIRST (run the VERIFICATION block at the bottom before applying) !!
-- If RLS is currently DISABLED, enabling it makes the table deny-by-default
-- until the policies below exist — apply this whole file in one go. If a
-- permissive insert policy already exists (e.g. created in the dashboard),
-- DROP it: policies for the same command are OR'd together, so a leftover
-- "allow all inserts" policy would let the size cap be bypassed.

-- 1. Enable row-level security. With RLS on and no matching policy, access is
--    denied by default; the policies below re-grant exactly what the app needs.
alter table public.messages enable row level security;

-- 2. Anyone may read the chat history. Required for the initial fetch,
--    pagination, and realtime postgres_changes delivery (Realtime gates
--    INSERT events on the subscriber having SELECT access under RLS).
drop policy if exists "messages_select_all" on public.messages;
create policy "messages_select_all" on public.messages
  for select
  to anon, authenticated
  using (true);

-- 3. Anyone may post, but only well-formed, size-bounded rows. WITH CHECK runs
--    server-side, so it holds even against a client that skips the UI and hits
--    the REST endpoint directly with the public anon key.
drop policy if exists "messages_insert_bounded" on public.messages;
create policy "messages_insert_bounded" on public.messages
  for insert
  to anon, authenticated
  with check (
    content is not null
    and char_length(content) between 1 and 500
    and username is not null
    and char_length(username) between 1 and 60
  );

-- 4. No UPDATE/DELETE policies → those operations are denied for anon and
--    authenticated under RLS. The trim trigger from
--    20260602_trim_messages_to_500.sql is SECURITY DEFINER (runs as the table
--    owner, bypasses RLS), so history trimming keeps working.

-- NOTE: true per-client rate limiting is NOT possible here — anonymous callers
-- have no stable identity (no auth.uid()) for a per-user trigger to key on.
-- To actually throttle abuse, pick one:
--   (a) enable Supabase anonymous sign-ins, then a per-auth.uid() insert-rate
--       trigger / policy;
--   (b) rate-limit at the edge (Cloudflare WAF rate-limiting rule in front of
--       the Supabase REST/Realtime hostnames);
--   (c) an Edge Function gateway that throttles before inserting.

-- ---------------------------------------------------------------------------
-- VERIFICATION — run these BEFORE and AFTER applying:
--
--   -- Is RLS enabled on the table?
--   select relname, relrowsecurity
--   from pg_class
--   where relname = 'messages';
--
--   -- Which policies exist (look for any leftover permissive insert policy)?
--   select policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where tablename = 'messages';
--
-- Then smoke-test from the app: chat history loads (SELECT works), a normal
-- message sends (INSERT works), and a >500-char insert via the REST API is
-- rejected with a row-level-security / check violation.
