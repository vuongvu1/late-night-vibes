-- 20260622_feedback_table.sql
-- Backing store for the InfoPanel feedback form. The browser ships the public
-- anon key, so this table is locked down the same way as public.messages:
-- RLS on, and anon/authenticated may ONLY insert size-bounded rows. There is
-- deliberately NO select/update/delete policy, so a client wielding the anon
-- key can submit feedback but cannot read, edit, or wipe what others sent.
--
-- You read submissions in the Supabase dashboard (Table editor / SQL editor),
-- which uses the service role and bypasses RLS.
--
-- NOT auto-applied. Apply via the Supabase SQL editor or `supabase db push`,
-- exactly like the other migrations in this folder.

-- 1. The table. id + created_at are auto-generated, so the client inserts only
--    { content } — matching src/components/InfoPanel/index.tsx.
create table if not exists public.feedback (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  content text not null
);

-- 2. Enable row-level security. With RLS on and no matching policy, access is
--    denied by default; the insert policy below re-grants exactly what the form needs.
alter table public.feedback enable row level security;

-- 3. Anyone may submit, but only well-formed, size-bounded rows. WITH CHECK runs
--    server-side, so it holds even against a client that skips the UI and hits
--    the REST endpoint directly with the public anon key. (1000 = textarea maxLength.)
drop policy if exists "feedback_insert_bounded" on public.feedback;
create policy "feedback_insert_bounded" on public.feedback
  for insert
  to anon, authenticated
  with check (
    content is not null
    and char_length(content) between 1 and 1000
  );

-- 4. No SELECT/UPDATE/DELETE policies → those operations are denied for anon and
--    authenticated under RLS. Only the dashboard (service role) can read feedback.

-- ---------------------------------------------------------------------------
-- VERIFICATION — after applying:
--   -- RLS enabled?
--   select relname, relrowsecurity from pg_class where relname = 'feedback';
--   -- Only the insert policy exists?
--   select policyname, cmd, with_check from pg_policies where tablename = 'feedback';
-- Then submit feedback from the app and confirm a row appears in the dashboard,
-- and that a SELECT via the anon REST API returns zero rows (read is denied).
