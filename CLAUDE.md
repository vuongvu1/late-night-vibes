# CLAUDE.md

Guidance for working in this repo.

## What this is

**Late Night Vibes** — a single-page web app that plays live lofi YouTube radio channels
with an ambient sound mixer, a global anonymous live chat, and animated backgrounds.
React 19 + TypeScript, built with Vite, deployed as a static SPA on Cloudflare Workers.

## Tech stack

- **UI:** React 19 (with the React Compiler), TypeScript, CSS Modules.
- **State:** Zustand (`src/store/index.ts`) — one global store.
- **Backend:** Supabase (Postgres + realtime) for chat and the online-listener counter.
- **Tooltips:** Radix UI. **PWA:** `vite-plugin-pwa`.
- **Build/deploy:** Vite + Wrangler (Cloudflare Workers), config in `wrangler.jsonc`.
- **Tests:** Vitest + Testing Library (jsdom), setup in `src/test/setup.ts`.

## Commands

```sh
pnpm dev            # start the dev server
pnpm build          # tsgo && vite build
pnpm test           # run vitest
pnpm lint           # biome check (lint + format check + import sort; fails on warnings)
pnpm format         # biome check --write (apply lint fixes + formatting)
pnpm type-check     # tsgo --noEmit
pnpm preview        # build + wrangler dev (local production preview)
pnpm deploy         # build + wrangler deploy
pnpm generate-static # extract first frame of each animated bg (needs ImageMagick `magick`)
```

> **pnpm gotcha:** on some local setups the `pnpm` wrapper throws a corepack error. If
> that happens, run the underlying tool directly with `npx` (e.g. `npx vitest`,
> `npx tsgo --noEmit`, `npx biome check`) instead of the `pnpm` script.

Tests live next to source as `*.test.ts(x)`. Run a single file with `npx vitest run <path>`.

## Architecture

- **`src/App.tsx`** — composition root: wires the store, hooks, and components together
  and registers global keyboard shortcuts via `useKeyPress`.
- **`src/store/index.ts`** — Zustand store: playback, volume, active channel
  (deep-linkable via URL hash `#<n>`), chat/mixer open state, and the ambient sound
  effects array. Capped at **5 simultaneously active** ambient sounds. UI actions play
  short click sounds.
- **`src/hooks/`** — `usePlayer`, `useChannel`, `useSoundEffects`, `useKeyPress`,
  `useDraggable`, `useAutoSwitchChannelWhenDown`.
- **`src/components/`** — presentational components, each in its own folder with a
  co-located test and CSS Module; re-exported from `src/components/index.ts`.
- **`src/services/supabase.ts`** — Supabase client (reads `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_ANON_KEY` from the env).
- **`src/data.json`** — the list of YouTube channels.
- **`src/components/Background/schedule.ts`** — deterministic, seeded background rotation
  so every visitor sees the same image at the same wall-clock moment (seed/timings in
  `src/constants.ts`). Don't reintroduce per-client randomness here.

### Adding a background

Backgrounds are discovered by glob, not a manifest — `schedule.ts` pairs
`src/assets/gifs/<name>.{gif,webp}` with `src/assets/static/<name>.jpg` by **base
filename**. A background is only eligible when **both** files exist with the same name.
To add one:

1. Drop the animated source in `src/assets/gifs/` named `vibe-<N>.gif` (or `.webp`),
   where `<N>` is the next free sequential number (zero-padded to 3+ digits, e.g.
   `vibe-400.gif`). The rotation is name-keyed, so the filename must follow this
   convention — not the original download name.
2. Run `pnpm generate-static` — it extracts frame `[0]` of every gif/webp that lacks a
   matching `.jpg` into `src/assets/static/` (needs ImageMagick `magick`). Existing
   statics are skipped, so only the new one is generated.
3. That's it — no code/JSON edit. `commonKeys` picks it up at build time. (`src/data.json`
   is YouTube channels, unrelated to backgrounds.)

### Component conventions

- `Button` (`src/components/Button/index.tsx`) takes an `icon` and forwards button props;
  pass an optional **`badge`** node to render a small count badge in the top-right corner
  (e.g. the ControlPanel mixer button shows `activeSoundCount` while sounds are playing).

## Supabase / chat — IMPORTANT

The live Supabase schema (tables, RLS, triggers) is **managed in the Supabase dashboard,
not fully tracked in this repo.** Don't assume the repo reflects the live DB — verify
against the live project. A real example bit us: a dashboard-only trigger silently capped
the chat table at 100 rows.

Chat history is bounded to the **newest 500 messages** by a Postgres `AFTER INSERT`
trigger. That trigger is the one piece tracked here, in
`supabase/migrations/20260602_trim_messages_to_500.sql`. It is **not** auto-applied —
apply it via the Supabase SQL editor or `supabase db push`. See
`docs/superpowers/specs/2026-06-02-chat-history-retention-design.md` and the matching
plan in `docs/superpowers/plans/` for the full design and verification steps.
