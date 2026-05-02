# Make `openlog init` idempotent and diff-sync AI-tool files

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** Ships as v0.4.1 together with this record

## Summary

Reshape `openlog init` so it is safe to re-run on a project that has
already been initialized. The two new rules are:

1. **AI-tool folders (`.claude/`, `.github/`) are diff-synced.** For
   each generated SKILL/command file, the CLI compares the desired
   content against what is on disk and reports it as `created` (file
   was missing), `updated` (file existed with different content), or
   `unchanged` (byte-identical). Outdated files are refreshed; missing
   files are restored.
2. **Existing `openlog/` is skipped, not fatal.** Previously, running
   `openlog init` against a project where `openlog/` already existed
   and was non-empty would throw and abort. The new behavior calls
   `mkdir -p` on the required subdirectories and continues with the
   tool-file sync, so the command is safe to re-run after every CLI
   upgrade.

## Motivation / context

After `openlog update` shipped in v0.4.0, the natural next step for
users is "rerun `openlog init` to pick up newer skill/command
templates". The old behavior actively fought that workflow: any
non-empty `openlog/` was treated as a hard error, and `--force` was
the only escape hatch — but `--force` also blew away `project.md`,
which users are expected to edit. The result was that nobody could
upgrade a tool file without risking their hand-written project notes.

The new model separates the two concerns:

- Structure and tool files: **always idempotent**. Re-running is
  cheap, never destructive, and surfaces what actually changed via
  per-file `[created] / [updated] / [unchanged]` tags.
- `project.md`: still preserved if it exists; `--force` is now scoped
  to "regenerate `project.md`" only.

## Key changes

- `src/core/init.ts`:
  - `createOpenlogStructure` no longer throws on an existing
    non-empty `openlog/`. It runs `mkdir -p` on every required
    subdirectory and returns `{ existed }` so the spinner can render
    "Verified" instead of "Created" when re-syncing.
  - New `writeIfChanged(target, content)` helper performs a
    byte-compare against the on-disk file and returns
    `'created' | 'updated' | 'unchanged'`. Used by both
    `createProjectMd` and `generateSkillsAndCommands`.
  - `generateSkillsAndCommands` now records a per-file
    `FileWriteResult` rather than just a path string. Skill and
    command files are routed through `writeIfChanged` so unchanged
    files are not rewritten (saves mtime churn and lets the summary
    report the real outcome).
  - `printSummary` gained a `structureExisted` parameter, switches
    its headline to "Openlog re-sync complete" on rerun, and prints
    each path with a `[created] / [updated] / [unchanged]` tag.
  - Added `FileWriteStatus`, `FileWriteResult`, `countByStatus`, and
    `formatFileStatus` to support the new reporting.
- `src/cli/index.ts`: `--force` description updated to reflect its
  narrower scope ("Regenerate `openlog/project.md` even if it already
  exists. The `openlog/` structure and AI-tool files are always
  synced idempotently.").
- `dist/`: rebuilt artifacts for `init.{js,d.ts,*.map}` and
  `cli/index.{js,*.map}` (committed because this package is
  distributed via git URL and `prepare` skips `tsc` when `dist/`
  exists — see the v0.3.5 record for the underlying npm 11 issue).

## Impact

- **Backwards compatibility:** `openlog init` against an empty/new
  directory behaves exactly as before. Against an already-initialized
  project, the previous "exists, not empty" error is gone — callers
  that relied on that error will now see a successful re-sync. No
  callers in this repo depend on it.
- **`--force` semantics narrowed:** the flag no longer guards
  structure creation (which is now always allowed). It only forces a
  fresh `project.md`. Documented in the CLI help and README.
- **Output format changed:** the summary now shows `[created]` /
  `[updated]` / `[unchanged]` tags next to each file. Anything that
  scrapes the output string-by-string would need to adapt — no known
  consumers do this today.

## Verification

- `npm run build`: pass.
- Manual integration test against a `/tmp` scratch dir:
  1. **Fresh init** (`--tools claude,github-copilot`): all six
     generated files reported as `[created]`, `openlog/` reported as
     "Created".
  2. **Idempotent re-run**: every file reported `[unchanged]`,
     `openlog/` reported as "Verified", `project.md` reported as
     "Kept existing", exit code 0.
  3. **Drift recovery**: deleted
     `.claude/skills/openlog-apply/SKILL.md` and appended garbage to
     `.claude/commands/oplg/record.md`, then re-ran. The CLI reported
     `1 created, 1 updated, 2 unchanged` for Claude Code (and `2
     unchanged` for GitHub Copilot), restoring the deleted file and
     overwriting the tampered one.
- Verified `openlog/specs/`, `openlog/changes/archive/`, and
  `project.md` survived all reruns intact.

## Follow-ups

- [ ] Decide whether to expose a `--check`-style mode for `openlog
      init` that reports drift without writing (mirrors
      `openlog update --check`).
- [ ] Consider a future `openlog sync` alias if "init" terminology
      becomes confusing now that the command is genuinely
      re-runnable.
- [x] Bumped `0.4.0` → `0.4.1` (patch — strictly additive
      capability; old "exists, not empty" error was an obstacle, not
      a contract).
