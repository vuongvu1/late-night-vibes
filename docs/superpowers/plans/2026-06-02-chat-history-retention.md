# Chat History Retention Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bound the Supabase `messages` table to the newest 500 rows via a Postgres `AFTER INSERT` trigger, so chat history can't grow without limit and DB stays within free-tier size.

**Architecture:** A `SECURITY DEFINER` trigger function trims the table to 500 rows on every insert; a one-time `DELETE` in the same migration clears any existing backlog. The repo gains a tracked migration file and a README note. No frontend/Worker code changes — the existing realtime feed and scroll-up pagination already behave correctly against a smaller table.

**Tech Stack:** PostgreSQL (Supabase), SQL DDL. Applied to the live DB via the Supabase SQL editor or `supabase db push`.

---

## Notes on testing approach (read first)

This change is **DDL applied to a managed Postgres**, not application code. There is no
in-repo test harness for it: the repo holds only the Supabase **anon** key (`.env`),
which cannot run DDL or delete rows, and the Supabase CLI is not installed. So:

- **Tasks 1–2** (create migration file, update README) are ordinary repo edits an agent
  can do and commit.
- **Task 3** (apply + verify) is a **MANUAL operator step** performed by a human in the
  Supabase dashboard SQL editor. It preserves red→green discipline: run the verification
  query *before* applying (table is NOT capped) and *after* (table IS capped at 500).

Do not fabricate vitest tests for the SQL file — the verification query in Task 3 is the test.

---

## Task 1: Add the Supabase migration file

**Files:**
- Create: `supabase/migrations/20260602_trim_messages_to_500.sql`

- [ ] **Step 1: Create the migration file**

Create `supabase/migrations/20260602_trim_messages_to_500.sql` with exactly this content:

```sql
-- 20260602_trim_messages_to_500.sql
-- Keep only the newest 500 chat messages so the table size stays bounded
-- (protects Supabase free-tier DB size). Applied once to the Supabase project
-- via the SQL editor or `supabase db push`.

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
```

- [ ] **Step 2: Verify the file was written correctly**

Run: `grep -c "trim_messages_after_insert" supabase/migrations/20260602_trim_messages_to_500.sql`
Expected: `2` (one in the `drop trigger`, one in the `create trigger`).

Run: `grep -c "offset 500 limit 1" supabase/migrations/20260602_trim_messages_to_500.sql`
Expected: `2` (one in the function, one in the one-time backlog trim).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260602_trim_messages_to_500.sql
git commit -m "feat: add migration to auto-trim chat messages to newest 500

AFTER INSERT trigger (SECURITY DEFINER) keeps public.messages bounded
at 500 rows; one-time DELETE clears any existing backlog on apply.

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Document chat retention in the README

**Files:**
- Modify: `README.md` (insert a new section between "Background Assets" and "Contributing")

- [ ] **Step 1: Add the retention section**

Edit `README.md`. Find this exact text:

```
## Contributing
```

Replace it with (note the new section is inserted *before* `## Contributing`):

````markdown
## Chat History Retention

The live chat stores messages in a Supabase `messages` table. To keep the database within free-tier size limits, a Postgres trigger automatically trims the table to the **newest 500 messages** on every insert.

The trigger lives in `supabase/migrations/20260602_trim_messages_to_500.sql`. It is **not** applied automatically from this repo — apply it once to your Supabase project, either by pasting the file's contents into the **Supabase SQL editor**, or with the Supabase CLI:

```sh
supabase db push
```

## Contributing
````

- [ ] **Step 2: Verify the edit**

Run: `grep -c "Chat History Retention" README.md`
Expected: `1`

Run: `grep -c "## Contributing" README.md`
Expected: `1` (the section was inserted before it, not duplicated).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: document chat history retention (500-message cap)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Apply and verify on Supabase (MANUAL — human operator)

**Files:** none (operations run in the Supabase dashboard SQL editor).

> This task cannot be automated from the repo (no service-role key, no Supabase CLI).
> A human with access to the Supabase project performs these steps. Each block is
> copy-pasted into the **SQL editor** and run.

- [ ] **Step 1: RED — confirm the table is NOT capped yet**

Paste and run (inserts 600 rows in a transaction, then rolls back — leaves the real chat untouched):

```sql
begin;
insert into public.messages (username, content)
  select 'test', 'msg ' || g from generate_series(1, 600) g;
select count(*) from public.messages;
rollback;
```

Expected: count is **(current rows + 600)** — i.e. clearly **not** capped at 500
(e.g. 600+ on a near-empty table). This proves no trimming exists yet.

- [ ] **Step 2: Apply the migration**

Paste the entire contents of `supabase/migrations/20260602_trim_messages_to_500.sql`
into the SQL editor and run it.

Expected: "Success. No rows returned." The function and trigger are created, and any
existing backlog beyond 500 rows is trimmed immediately.

- [ ] **Step 3: GREEN — confirm the cap now holds**

Paste and run the same verification as Step 1:

```sql
begin;
insert into public.messages (username, content)
  select 'test', 'msg ' || g from generate_series(1, 600) g;
select count(*) from public.messages;
rollback;
```

Expected: count is exactly **500**. The trigger trimmed the insert down to the cap.

- [ ] **Step 4: Live sanity check**

Paste and run:

```sql
select count(*) from public.messages;
```

Expected: a number **≤ 500**. Confirms the one-time backlog trim took effect on the
real table.

- [ ] **Step 5: (Reference only) Rollback, if ever needed**

To fully remove the feature later:

```sql
drop trigger if exists trim_messages_after_insert on public.messages;
drop function if exists public.trim_messages();
```

---

## Self-Review

**Spec coverage:**
- Retention rule "keep newest 500" → Task 1 function/trigger + one-time trim. ✓
- Enforcement via AFTER INSERT statement-level trigger → Task 1 Step 1. ✓
- Security (`SECURITY DEFINER`, pinned `search_path`, no anon `DELETE` grant) → Task 1 SQL; no grant changes anywhere. ✓
- No frontend change → reflected in plan Goal/Architecture; no frontend tasks. ✓
- New file `supabase/migrations/20260602_trim_messages_to_500.sql` → Task 1. ✓
- README note → Task 2. ✓
- Non-destructive verification (insert 600 in txn, expect 500, rollback) → Task 3 Steps 1 & 3. ✓
- Rollback SQL → Task 3 Step 5 (matches spec). ✓

**Placeholder scan:** No TBD/TODO/"handle edge cases". All SQL and commands are complete and literal.

**Type/identifier consistency:** Function `public.trim_messages()`, trigger `trim_messages_after_insert`, table `public.messages`, cap `500`, file path `supabase/migrations/20260602_trim_messages_to_500.sql` — all identical across the migration, README, and verification steps.
