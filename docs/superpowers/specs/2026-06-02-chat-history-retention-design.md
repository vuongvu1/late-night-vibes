# Chat History Retention — Auto-Trim to 500

**Date:** 2026-06-02
**Status:** Approved
**Topic:** Bound the Supabase `messages` table so chat history can't grow without limit.

## Problem / Motivation

Late Night Vibes has a single global, anonymous chatroom. Messages are stored in a
Supabase Postgres table `messages` (`id`, `created_at`, `username`, `content`),
delivered in real-time, and paginated 5 at a time on scroll-up. Nothing ever deletes
messages, so the table grows **forever**. The concern is **Supabase database size /
row count** — the free tier caps the database around 500 MB, and an unbounded chat log
will eventually eat into that.

## Goal

Enforce a hard cap on the table: keep only the **newest 500 messages**. Table size
becomes permanently bounded regardless of traffic, with **no change to the live chat
experience**.

## Non-Goals

- Time-based retention or "freshness" rules (rejected in favor of a hard size cap).
- Client-side in-memory message array growth during very long sessions — that's
  browser memory, not DB storage, and is a separate, out-of-scope concern.
- Migrating the entire DB schema into version control — only *this* change is tracked.

## Decision Summary

- **Retention rule:** keep newest **N = 500** messages (a hard cap, not a time window).
  A hard cap bounds storage no matter how busy the room gets.
- **Enforcement:** an `AFTER INSERT`, statement-level **trigger** in Postgres (Supabase).
  - Chosen over **`pg_cron` scheduled trim** — the trigger keeps the table *always*
    ≤ 500 with no scheduler to configure; cron only wins at very high insert volume.
  - Chosen over a **Cloudflare Worker cron trigger** — that would require introducing a
    Worker script (today the Worker serves static assets only) plus storing a Supabase
    service-role key as a secret, splitting logic across two platforms for a one-line
    `DELETE`.
  - **Client-side deletion rejected** — it would only run while someone is online and
    would require a dangerous `DELETE` grant to the anonymous role.

## Design

### Migration SQL

```sql
-- Function: keep only the newest 500 messages
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

-- Trigger: run once per insert statement
drop trigger if exists trim_messages_after_insert on public.messages;
create trigger trim_messages_after_insert
after insert on public.messages
for each statement
execute function public.trim_messages();
```

The subquery returns the `id` of the 501st-newest row; `id <= that` deletes it and
everything older, leaving exactly the newest 500. With fewer than 501 rows the subquery
is `NULL` and nothing is deleted. `for each statement` fires once per insert (not per
row), so it is cheap and batch-safe. The SQL is idempotent and safe to re-run.

### Security

- `security definer` + pinned `search_path = public`: the function runs with the
  owner's rights (so RLS doesn't block its `DELETE`) and can't be hijacked via a mutable
  search path.
- We do **not** grant `DELETE` to the `anon` role. Clients keep insert/select only —
  no "anyone can wipe the chat" hole.

### Behavior & Impact

- Table is **always ≤ 500 rows** (~tens of KB on disk).
- The realtime feed is **unaffected**: the client subscribes to `INSERT` events only;
  deletes are not broadcast and the client takes no action on them.
- "Load older messages" naturally stops once it reaches the 500-row floor
  (`hasMore` flips to `false`). **No frontend change required.**

### Files

- `supabase/migrations/20260602_trim_messages_to_500.sql` — *new*; the migration above.
- `README.md` — short note on applying it (Supabase SQL editor, or `supabase db push`).

### Verification (non-destructive)

Run in the Supabase SQL editor. Inserts 600 rows inside a transaction, confirms the
trigger trimmed to 500, then rolls back so the real chat is untouched:

```sql
begin;
insert into public.messages (username, content)
  select 'test', 'msg ' || g from generate_series(1, 600) g;
select count(*) from public.messages;  -- expect 500
rollback;
```

### Rollback

```sql
drop trigger if exists trim_messages_after_insert on public.messages;
drop function if exists public.trim_messages();
```

## Assumptions

- The repo cannot introspect the live Supabase DB. This design assumes the existing
  `public.messages` table has a monotonic `bigserial`/identity `id`, with RLS enabled
  allowing `anon` to insert/select but not delete. The SQL is applied via the Supabase
  SQL editor or `supabase db push`, not auto-run from this repo.

## Open Questions

None.
