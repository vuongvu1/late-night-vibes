# Faster lint/format/type-check — Biome + tsgo — design

**Date:** 2026-06-05
**Status:** Approved (ready for implementation plan)

## Goal

Make linting, formatting, and type-checking faster by replacing the current
tools with native/Rust-based equivalents:

- **Type-checking:** swap `tsc` for **`tsgo`** (TypeScript Native Preview,
  `@typescript/native-preview`).
- **Linting + formatting:** replace **ESLint** entirely with **Biome**
  (`@biomejs/biome`), which also adds formatting (the repo has none today).

## Context

- **`@/*` path alias:** resolved at type-check time via `tsconfig.json` `paths`,
  and at build/test time via Vite's and Vitest's own `resolve.alias` (the two
  are independent).
- **Type-check today:** `type-check` = `tsc --noEmit`; `build` = `tsc && vite
  build`. Because `tsconfig.json` sets `"noEmit": true`, the `tsc` in `build` is
  purely a type-check gate — Vite (esbuild/Babel) does all emit. tsc never
  emits for this project.
- **Lint today:** `lint` = `eslint . --max-warnings 0`, flat config
  (`eslint.config.js`) with `@eslint/js`, `typescript-eslint`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, and
  `eslint-plugin-react-compiler`.
- **Format today:** none. No Prettier, no `.editorconfig`. Formatting is
  editor-only / unenforced.
- **No CI workflows and no git hooks** — these tools run manually and in the
  editor. So this change has no pipeline to update.
- **Codebase size:** 74 `.ts`/`.tsx`, 16 `.css` (CSS Modules), 1 `.json`
  (`src/data.json`). Existing style: double quotes, 2-space indent.
- **`typescript` stays a dependency.** typescript-eslint is removed, but
  `typescript` is the default editor/LSP engine and a zero-cost fallback while
  tsgo is a preview. Only the *CLI scripts* move to tsgo.

## Accepted trade-off (decided during brainstorming)

We go **full Biome and drop ESLint**. Biome cannot run ESLint plugins, so two
lint rules are **deliberately lost**:

- `react-compiler/react-compiler` — flags code that violates the Rules of React
  the React Compiler depends on.
- `react-refresh/only-export-components` — a dev-only Fast Refresh hint.

The React-hooks coverage (`rules-of-hooks`, `exhaustive-deps`) is **preserved**
via Biome's equivalents (see below). The React Compiler itself still runs at
build time via `babel-plugin-react-compiler` in the Vite config — only the
*lint-time* check is gone.

## Design

### 1. Type-checking → tsgo

- Add devDependency `@typescript/native-preview` (provides the `tsgo` binary).
- Scripts:
  - `type-check`: `tsc --noEmit` → **`tsgo --noEmit`**
  - `build`: `tsc && vite build` → **`tsgo && vite build`**
- **One small `tsconfig.json` change is required** (discovered during
  implementation). tsgo is TypeScript 7, which **removed the `baseUrl` option**
  and rejects non-relative `paths`. The current config has `"baseUrl": "."` and
  `"@/*": ["src/*"]`, which `tsc` (TS 6) tolerates but `tsgo` errors on
  (`TS5102`, `TS5090`). Fix: **remove `baseUrl`** and change the mapping to
  `"@/*": ["./src/*"]`. This is behavior-preserving:
  - `paths` without `baseUrl` is supported by `tsc` since TS 5.0, so the `tsc`
    fallback stays green.
  - Vite **and** Vitest resolve `@` via their own `resolve.alias`
    (`path.resolve(__dirname, "./src")`), independent of tsconfig — so the build
    and tests are unaffected.
  - The `@/*` alias and its usages in source are unchanged; only the tsconfig
    mapping string changes.
- The `references: [{ path: "./tsconfig.node.json" }]` field only takes effect
  in `-b` build mode, which we don't use, so `tsgo --noEmit` checks the same set
  (`src`, `global.d.ts`) as `tsc --noEmit` does today. `tsconfig.node.json` is
  unchanged.
- Keep `typescript` in devDependencies (editor/LSP + fallback).

### 2. Lint + format → Biome

- Add devDependency `@biomejs/biome`. Add `biome.json` at the repo root.
- **Delete** `eslint.config.js`.
- **Remove** devDependencies: `eslint`, `@eslint/js`, `typescript-eslint`,
  `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`,
  `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`,
  `eslint-plugin-react-compiler`, `globals`.
- Scripts:
  - `lint`: `eslint . --max-warnings 0` → **`biome check`**
    (lint + format-check + import-sort; non-writing gate, fails on any issue —
    the CI/pre-merge command).
  - add **`format`**: `biome check --write` (applies safe fixes + formatting +
    import sorting).

#### `biome.json` config

- **Formatter** (chosen to match existing style, minimize churn):
  `indentStyle: "space"`, `indentWidth: 2`, `lineWidth: 80`,
  `quoteStyle: "double"`.
- **Linter:** `recommended` enabled, plus explicitly enable the hooks
  equivalents to retain the `react-hooks` coverage:
  - `correctness/useExhaustiveDependencies` (≈ `exhaustive-deps`)
  - `correctness/useHookAtTopLevel` (≈ `rules-of-hooks`)
- **VCS / ignores:** `vcs: { enabled: true, clientKind: "git", useIgnoreFile:
  true }`, and explicitly ignore `dist`, `node_modules`, `.wrangler`, and
  lockfiles.
- **Scope:** TS/TSX, CSS, and JSON. Biome formats all three — a net gain, since
  CSS and JSON have no formatter today.

### 3. First-run reformat → two commits

Because nothing formats the code today, the first `biome check --write` will
reformat (and import-sort) most files. To keep history reviewable, land the
work as **two commits**:

1. `chore: replace eslint/tsc with biome + tsgo` — deps, scripts, `biome.json`,
   delete `eslint.config.js`. **No source reformatting.**
2. `style: apply biome formatting` — the bulk mechanical reformat / import sort,
   isolated so it never hides a functional change.

### 4. Documentation

Update `CLAUDE.md` and `README.md` where they reference the old commands:

- Commands table: `lint` now runs Biome; add `format`; `type-check`/`build` use
  tsgo. Note the pnpm-wrapper gotcha applies to `biome`/`tsgo` too (use `npx`).
- Tech-stack/tooling notes: ESLint → Biome (lint + format), tsc → tsgo.

## Verification (before claiming done)

- `npx tsgo --noEmit` → 0 errors. Sanity-check it *catches* a deliberately
  introduced type error, then revert the deliberate break.
- `npx biome check` → clean after the reformat commit.
- `pnpm build` (= `tsgo && vite build`) succeeds.
- `npx vitest run` → still green (no source-behavior change expected).

## Risks / rollback

- **tsgo is a preview.** If it misreports diagnostics or chokes on the config,
  revert the two scripts to `tsc` (still installed) — a one-line change. The
  rest of the migration (Biome) is independent and unaffected.
- **Lost lint rules** (`react-compiler`, `react-refresh`) — accepted and
  documented above. The React Compiler still runs at build time.
