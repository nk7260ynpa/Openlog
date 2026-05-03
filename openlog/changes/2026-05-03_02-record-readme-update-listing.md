# docs(readme): list update.ts and update command in project layout

- **Date:** 2026-05-02
- **Author:** nk7260ynpa
- **Related commit:** 2d196a7

## Summary

Brought the `Project layout` block in `README.md` back in sync with the
actual `src/` tree. The block still claimed the CLI was
`(--version, init)` and omitted `src/core/update.ts`, even though
`openlog update` had already shipped (v0.4.0). Two lines were corrected so
the layout matches reality. This record is being written as a backfill in
the next session — the original commit was not captured under
`openlog/changes/` at the time it shipped.

## Motivation / context

`README.md` is the user-facing source of truth for this repo (per
`CLAUDE.md`), so the `Project layout` block must accurately describe the
shipped surface area. After `openlog update` shipped, the layout block was
not updated alongside it, leaving readers with an incorrect mental model of
which CLI subcommands and source files exist.

## Key changes

- `README.md` (`Project layout` block):
  - `commander definitions (--version, init)` → `(--version, init, update)`.
  - Inserted a new line documenting `core/update.ts` — `UpdateCommand:
    re-install latest source globally`.

## Impact

- Documentation-only; no runtime behavior change.
- No code, build, or scaffolding files were touched. The CLI itself was
  already fully wired up before this commit.

## Verification

- Diff inspection only (`git show 2d196a7`); the change is two lines inside
  the README layout fence.
- No build or smoke test was required.

## Follow-ups

- [ ] None — the layout is now consistent with `src/` and has stayed
      consistent in subsequent commits (e.g. the `/oplg:explore` addition
      extended the same block in 039993e).
