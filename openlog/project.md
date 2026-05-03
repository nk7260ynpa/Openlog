# Openlog

> Maintained by `/oplg:record`. `/oplg:apply` is read-only over this file.

## Overview

Openlog is a small Node CLI that scaffolds an `openlog/` directory plus
matching slash commands / Agent Skills for selected AI tools (currently
Claude Code and GitHub Copilot). The scaffolding installs a fixed
three-stage workflow — `/oplg:explore`, `/oplg:apply`, `/oplg:record` —
plus an auxiliary `/oplg:verify` review command, that lets an AI
assistant research, edit, review, and log changes against a codebase
under a strict surface-ownership contract.

This file is the entry point to the `openlog/` directory itself; for
the user-facing CLI documentation see the repo-root `README.md`.

## Layout

- **`openlog/project.md`** (this file): project overview and entry
  point.
- **`openlog/specs/`**: stable specifications. Currently:
  - `oplg-pipeline-contract.md` — the authoritative contract for the
    three `/oplg:*` workflows and their surface ownership.
- **`openlog/changes/`**: per-entry change records, named
  `<YYYY-MM-DD>_<NN>-<slug>.md` (`<NN>` is the daily completion
  counter). Authored exclusively by `/oplg:record`.

The wider repo layout (`src/`, `dist/`, `bin/`, `build.js`, …) is
described in the repo-root `README.md` and `CLAUDE.md`.

## Tech stack

- **Language:** TypeScript, compiled by local `tsc` via `node build.js`.
- **Runtime:** Node 18+. CLI entry point is `bin/openlog.js`, which
  loads `dist/cli/index.js`.
- **CLI framework:** `commander`.
- **Package manager:** `pnpm` for development; `npm i -g` is the
  supported global-install path. `dist/` is committed to the repo
  (since v0.3.5) so global installs do not need a TypeScript toolchain.
- **Tests:** [Vitest](https://vitest.dev/). Run with `npm test`
  (or `npx vitest run`). 42 unit/integration tests across 8 files.
- **CI:** GitHub Actions (`.github/workflows/ci.yml`). Triggered on
  `v*` tag push; runs build + test on a Node 20/22 matrix.

## Workflow surface ownership

The three `/oplg:*` workflows have **exclusive** write surfaces. The
authoritative wording lives in `openlog/specs/oplg-pipeline-contract.md`
(rev. 2); summary:

| Stage | Workflow | May write | May read | Must not write |
|-------|----------|-----------|----------|----------------|
| 1 | `/oplg:explore` | nothing | everything | everything |
| 2 | `/oplg:apply` | source code, `README.md`, `dist/`, configuration outside `openlog/` | everything | the entire `openlog/` directory |
| — | `/oplg:verify` | nothing (read-only) | everything | everything |
| 3 | `/oplg:record` | the entire `openlog/` directory (`project.md`, `specs/`, `changes/`) | everything | anything outside `openlog/` |

Drift across surfaces is reported via handoff lines, never via
cross-surface edits — Stage 3 emits "needs user decision" lines that
point the user back at Stage 2 when, e.g., `README.md` has drifted.

## Development workflow

1. **Research** with `/oplg:explore <topic>` — produces a structured,
   read-only report and a paste-ready handoff block.
2. **Ship** with `/oplg:apply <action>`, one entry per commit. Each
   entry: edit → sync `README.md` (when user-facing) → `node build.js`
   → commit → push.
3. **Review** (optional) with `/oplg:verify` — read-only code review
   scoped to the current session's `/oplg:apply` commits. Outputs a
   structured PASS/NEEDS_FIXES verdict.
4. **Log** with `/oplg:record` — auto-derives titles from the diff and
   writes one record per entry under `openlog/changes/`, plus any
   needed updates to `openlog/project.md` or `openlog/specs/`.

For the user-facing CLI surface (`openlog init`, `openlog update`) see
`README.md`.

## Roadmap pointers

Live roadmap is the "Roadmap" section in the repo-root `README.md`. The
items currently outstanding that affect this directory specifically:

- Spec / change-management subcommands (`openlog spec`, `openlog
  change`, …) for listing, validating, and archiving.
