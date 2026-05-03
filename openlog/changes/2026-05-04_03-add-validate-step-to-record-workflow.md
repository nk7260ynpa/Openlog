# feat(record): add automatic `openlog validate` step to `/oplg:record` workflow

- **Date:** 2026-05-04
- **Author:** nk7260ynpa
- **Related commit:** 6cc0825

## Summary

Added a new step 5 "Validate" to the `/oplg:record` workflow template.
After all record files and internal-doc updates are written (steps 3–4),
the workflow now automatically runs `openlog validate` to check format
consistency before committing. If validation fails, it attempts to fix
errors; if unfixable, it stops and reports to the user.

## Motivation / context

Previously, `/oplg:record` would commit record files without verifying
their format. Since `openlog validate` was just shipped in v0.5.9, it
made sense to integrate it into the record workflow so that newly written
records are guaranteed to pass validation before being committed.

## Key changes

- `src/core/templates/workflows/record.ts`: inserted step 5 "Validate"
  between the old step 4 (Sync internal docs) and old step 5 (Commit
  and push), renumbering subsequent steps (5→6, 6→7).
- `dist/core/templates/workflows/record.*`: rebuilt artifacts.

## Impact

- `/oplg:record` now has 7 steps instead of 6.
- Generated `.claude/commands/oplg/record.md` and skill files will
  include the new validate step after re-running `openlog init`.
- No breaking changes — the workflow still produces the same outputs;
  it just validates before committing.

## Verification

- `pnpm run build` — compiled cleanly (tsc 5.9.3).
- `/oplg:verify` — PASS verdict, no critical or important issues.

## Follow-ups

- [ ] Re-run `openlog init` on consuming repos to propagate the updated
      template.
