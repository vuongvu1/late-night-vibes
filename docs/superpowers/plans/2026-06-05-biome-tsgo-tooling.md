# Biome + tsgo Tooling Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `tsc` with `tsgo` for type-checking and replace ESLint with Biome for linting + formatting, to make lint/format/type-check faster.

**Architecture:** Pure tooling swap — no app source behavior changes. Swap the `type-check`/`build` scripts to the `tsgo` binary (TypeScript Native Preview), and replace the entire ESLint setup with Biome (one tool for lint + format + import-sort). `typescript` stays installed as the editor/LSP engine and a fallback. The first formatter run reformats the codebase; it is isolated in its own commit so functional/config diffs stay reviewable.

**Tech Stack:** `@typescript/native-preview` (`tsgo`), `@biomejs/biome`, pnpm, Vite, React 19 + React Compiler.

---

## Background notes for the implementer

- **pnpm gotcha (this repo):** the `pnpm` wrapper sometimes throws a corepack error. If a `pnpm …` command fails that way, re-run it as `npx pnpm@11.5.0 …` (keeps `pnpm-lock.yaml` consistent). For running installed binaries, `npx <bin>` also works (e.g. `npx tsgo`, `npx biome`).
- **Why no unit tests here:** this is a config/tooling change. The "tests" are the verification commands shown in each task (type-check passes, lint/format clean, build succeeds, existing vitest suite still green). Run them and confirm the expected output before committing.
- **Commit discipline (from the spec):** the bulk reformat **must** be its own commit (Task 3), separate from config/dependency changes (Tasks 1–2).
- **Accepted trade-off:** dropping ESLint loses the `react-compiler/react-compiler` and `react-refresh/only-export-components` lint rules. The React Compiler still runs at build time via `babel-plugin-react-compiler` in the Vite config — only the lint-time check is gone. This is intentional and documented in the spec.
- Work happens on branch `chore/biome-tsgo-tooling` (already created and checked out; the design doc is already committed there).

---

## File Structure

- **`package.json`** — scripts (`type-check`, `build`, `lint`, new `format`) and devDependencies (add biome + tsgo, remove the ESLint stack).
- **`biome.json`** (create) — Biome config: formatter, linter, import-sort, ignores.
- **`eslint.config.js`** (delete) — replaced by Biome.
- **`src/hooks/useResizable.ts`** (modify, lines 49–55) — remove a now-stale `eslint-disable` comment referencing the dropped `react-compiler` rule.
- **`CLAUDE.md`** (modify, lines 24–35) — update the commands block + pnpm-gotcha example to Biome/tsgo.
- **`tsconfig.json`** (modify) — tsgo (TS7) removed `baseUrl` and rejects
  non-relative `paths`; remove `baseUrl` and change `"@/*": ["src/*"]` →
  `"@/*": ["./src/*"]`. Behavior-preserving (Vite/Vitest resolve `@` via their
  own alias; `tsc` fallback supports `paths` without `baseUrl`).
- `tsconfig.node.json` — **unchanged**.
- README.md — **unchanged** (it does not name `eslint`/`tsc`; only `pnpm build`/`pnpm dev`, which keep working).

---

## Task 1: Switch type-checking from tsc to tsgo

**Files:**
- Modify: `package.json` (scripts `type-check`, `build`; add devDependency)
- Modify: `tsconfig.json` (remove `baseUrl`, make `@/*` path relative — required by tsgo)

- [ ] **Step 1: Install the tsgo binary**

Run:
```bash
pnpm add -D @typescript/native-preview
```
If the pnpm wrapper errors (corepack), run instead:
```bash
npx pnpm@11.5.0 add -D @typescript/native-preview
```
Expected: `@typescript/native-preview` appears under `devDependencies` in `package.json`, and `npx tsgo --version` prints a version.

- [ ] **Step 2: Point the type-check and build scripts at tsgo**

In `package.json`, change these two scripts:
```jsonc
// before
"build": "tsc && vite build",
"type-check": "tsc --noEmit",
// after
"build": "tsgo && vite build",
"type-check": "tsgo --noEmit",
```
Leave `typescript` in `devDependencies` (editor/LSP + fallback).

- [ ] **Step 2b: Make tsconfig tsgo-compatible**

tsgo is TypeScript 7: it removed `baseUrl` and rejects non-relative `paths` (errors `TS5102`/`TS5090`). In `tsconfig.json` `compilerOptions`:
```jsonc
// before
"baseUrl": ".",
"paths": {
  "@/*": ["src/*"]
}
// after  (remove baseUrl entirely; make the path relative)
"paths": {
  "@/*": ["./src/*"]
}
```
This is behavior-preserving: `tsc` (the retained fallback) supports `paths` without `baseUrl` since TS 5.0, and Vite/Vitest resolve `@` via their own `resolve.alias` (not tsconfig). Leave `tsconfig.node.json` untouched.

- [ ] **Step 3: Verify tsgo type-checks the project cleanly**

Run:
```bash
npx tsgo --noEmit
```
Expected: exits 0, no output (no type errors), and noticeably faster than `tsc`.

- [ ] **Step 4: Verify tsgo actually catches type errors (sanity check)**

Temporarily append a bad line to `src/constants.ts`:
```ts
const __typecheck_probe: number = "not a number";
```
Run:
```bash
npx tsgo --noEmit
```
Expected: FAIL — reports a type error on `__typecheck_probe` (string not assignable to number). Then revert:
```bash
git checkout src/constants.ts
```
Run `npx tsgo --noEmit` again → exits 0.

- [ ] **Step 5: Verify the build still works end-to-end**

Run:
```bash
pnpm build   # or: npx tsgo && npx vite build
```
Expected: tsgo passes, Vite build completes and writes `dist/`.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json
git commit -m "build: type-check with tsgo instead of tsc"
```

---

## Task 2: Replace ESLint with Biome (config + deps, no reformat)

**Files:**
- Create: `biome.json`
- Delete: `eslint.config.js`
- Modify: `package.json` (scripts `lint` + new `format`; remove ESLint devDependencies)
- Modify: `src/hooks/useResizable.ts:49-55` (remove stale eslint-disable comment)

- [ ] **Step 1: Install Biome**

Run:
```bash
pnpm add -D @biomejs/biome
```
(corepack fallback: `npx pnpm@11.5.0 add -D @biomejs/biome`)
Expected: `@biomejs/biome` in `devDependencies`; `npx biome --version` prints a 2.x version.

- [ ] **Step 2: Generate a base config**

Run:
```bash
npx biome init
```
Expected: creates `biome.json` with a `$schema` URL matching the installed version. **Keep that generated `$schema` line** in the next step.

- [ ] **Step 3: Write the project Biome config**

Replace the contents of `biome.json` with the following (keep the `$schema` value that `biome init` generated — do not hand-edit the version):
```jsonc
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "includes": ["**", "!**/dist", "!**/.wrangler"]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 80
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double"
    }
  }
}
```
Rationale: `useExhaustiveDependencies` (warn) + `useHookAtTopLevel` (error) replicate the old `eslint-plugin-react-hooks` coverage; `organizeImports` replaces nothing we had but is a free win; formatter settings (2-space, double quotes, width 80) match the existing code style. `vcs.useIgnoreFile` makes Biome respect `.gitignore` (which already ignores `dist`, `node_modules`, `.wrangler`).

- [ ] **Step 4: Validate the config against the installed Biome**

Run:
```bash
npx biome check
```
Expected: Biome runs and reports **formatting/lint findings** (the code isn't formatted yet — that's fine and expected at this step). It must NOT report a **configuration error**. If it reports unknown-key/schema errors (version drift), run:
```bash
npx biome migrate --write
```
then re-run `npx biome check` and confirm only findings (not config errors) remain.

- [ ] **Step 5: Swap the scripts and remove ESLint deps**

In `package.json`, change the `lint` script and add `format`:
```jsonc
// before
"lint": "eslint . --max-warnings 0",
// after
"lint": "biome check --error-on-warnings",
"format": "biome check --write",
```
(`--error-on-warnings` makes the `lint` gate fail on warnings, matching the old `--max-warnings 0`.)

Then remove the ESLint stack:
```bash
pnpm remove eslint @eslint/js typescript-eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-react-compiler globals
```
(corepack fallback: prefix with `npx pnpm@11.5.0`)
Expected: those 9 packages are gone from `devDependencies`. `typescript` and the `@types/*`, `vite`, `vitest`, etc. remain.

- [ ] **Step 6: Delete the ESLint config**

Run:
```bash
git rm eslint.config.js
```

- [ ] **Step 7: Remove the now-stale eslint-disable comment**

In `src/hooks/useResizable.ts`, the block at lines 49–55 references the dropped `react-compiler` rule. Replace:
```ts
      // Restore the saved size by writing to the DOM node directly. Refs are
      // React's sanctioned escape hatch for imperative DOM, but the React
      // Compiler lint can't tell this RefObject argument from an arbitrary
      // mutable arg, so it false-positives on the style writes below.
      // eslint-disable-next-line react-compiler/react-compiler
      el.style.width = `${saved.width}px`;
```
with:
```ts
      // Restore the saved size by writing to the DOM node directly. Refs are
      // React's sanctioned escape hatch for imperative DOM access.
      el.style.width = `${saved.width}px`;
```

- [ ] **Step 8: Verify the lint gate runs (findings expected, no crash)**

Run:
```bash
npx biome check
```
Expected: completes and reports formatting findings only (still unformatted — reformat happens in Task 3). No config error, no crash.

- [ ] **Step 9: Commit (config + deps only — no reformat)**

```bash
git add package.json pnpm-lock.yaml biome.json src/hooks/useResizable.ts
git rm --cached eslint.config.js 2>/dev/null; git add -A
git commit -m "chore: replace eslint with biome for lint + format"
```
Expected: commit contains `biome.json`, the script/dep changes, the deleted `eslint.config.js`, and the one-line comment edit in `useResizable.ts` — and **no** bulk source reformatting.

---

## Task 3: Apply the first Biome formatting pass (isolated commit)

**Files:**
- Modify: most `src/**/*.{ts,tsx,css}` and root JSON (mechanical reformat + import sort)

- [ ] **Step 1: Apply formatting and safe fixes**

Run:
```bash
npx biome check --write
```
Expected: Biome rewrites files to the configured style and sorts imports. Output summarizes files changed.

- [ ] **Step 2: Verify the lint/format gate is now clean**

Run:
```bash
npx biome check --error-on-warnings
```
Expected: exits 0 — no formatting findings, no lint errors, no warnings. If a genuine lint finding remains (e.g. a real `useExhaustiveDependencies` issue), fix it minimally or, if it is a deliberate false positive, suppress that single line with a `// biome-ignore lint/correctness/useExhaustiveDependencies: <reason>` comment, then re-run.

- [ ] **Step 3: Verify type-check still passes**

Run:
```bash
npx tsgo --noEmit
```
Expected: exits 0 (formatting must not introduce type errors).

- [ ] **Step 4: Verify the test suite still passes**

Run:
```bash
npx vitest run
```
Expected: all tests pass (formatting is behavior-preserving).

- [ ] **Step 5: Verify the production build**

Run:
```bash
pnpm build
```
Expected: tsgo + Vite build succeed.

- [ ] **Step 6: Commit the reformat on its own**

```bash
git add -A
git commit -m "style: apply biome formatting"
```

---

## Task 4: Update documentation

**Files:**
- Modify: `CLAUDE.md:22-35`

- [ ] **Step 1: Update the commands block and pnpm-gotcha note**

In `CLAUDE.md`, replace the commands block (lines 22–35) so it reads:
```md
```sh
pnpm dev            # start the dev server
pnpm build          # tsgo && vite build
pnpm test           # run vitest
pnpm lint           # biome check (lint + format + import sort, fails on warnings)
pnpm format         # biome check --write (apply lint fixes + formatting)
pnpm type-check     # tsgo --noEmit
pnpm preview        # build + wrangler dev (local production preview)
pnpm deploy         # build + wrangler deploy
pnpm generate-static # extract first frame of each animated bg (needs ImageMagick `magick`)
```

> **pnpm gotcha:** on some local setups the `pnpm` wrapper throws a corepack error. If
> that happens, run the underlying tool directly with `npx` (e.g. `npx vitest`,
> `npx tsgo --noEmit`, `npx biome check`) instead of the `pnpm` script.
```
(That is: `build` and `type-check` now use `tsgo`; `lint` now uses `biome check`; a new `format` line is added; and the gotcha example swaps `npx tsc`/`npx eslint` for `npx tsgo`/`npx biome`.)

- [ ] **Step 2: Verify docs are accurate**

Run:
```bash
grep -nE "tsc|eslint" CLAUDE.md
```
Expected: no matches (all references now point to `tsgo`/`biome`).

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update commands for biome + tsgo"
```

---

## Final verification (run all, confirm green)

- [ ] `npx tsgo --noEmit` → 0 errors
- [ ] `npx biome check --error-on-warnings` → clean
- [ ] `npx vitest run` → all pass
- [ ] `pnpm build` → succeeds
- [ ] `git log --oneline` shows the reformat (`style: apply biome formatting`) as a commit separate from the config/dep commits

---

## Self-Review (completed by plan author)

**Spec coverage:**
- tsgo for type-check + build → Task 1. ✅
- Biome for lint + format, drop ESLint entirely → Task 2. ✅
- Keep `typescript` installed → Task 1 Step 2 + Task 2 Step 5 (only the ESLint stack is removed). ✅
- Preserve react-hooks coverage via Biome equivalents → Task 2 Step 3 (`useExhaustiveDependencies`, `useHookAtTopLevel`). ✅
- Formatter style matching existing code (2-space, double quotes, width 80) → Task 2 Step 3. ✅
- CSS + JSON in scope → covered by `files.includes` `**` glob + Biome's native CSS/JSON support (exercised in Task 3 Step 1). ✅
- Reformat isolated in its own commit → Task 3 Step 6 (separate from Tasks 1–2). ✅
- Docs (CLAUDE.md) updated → Task 4. README intentionally untouched (names no removed tool). ✅
- Verification (tsgo catches errors, biome clean, build, vitest) → Task 1 Steps 3–5, Task 3 Steps 2–5, Final verification. ✅
- Risk/rollback (tsc fallback) → `typescript` retained; reverting two scripts restores tsc. Noted in Background. ✅

**Placeholder scan:** No TBD/TODO/"handle edge cases". The single conditional ("if a genuine lint finding remains") gives the concrete `biome-ignore` remedy. ✅

**Type/name consistency:** Script names (`lint`, `format`, `type-check`, `build`), the `biome check` / `biome check --write` / `--error-on-warnings` invocations, and the `biome.json` keys are used consistently across Tasks 2–4. ✅
