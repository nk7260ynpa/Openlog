# chore: Rename package scope from @chen to @nk7260ynpa

- **Date:** 2026-05-04
- **Author:** nk7260ynpa
- **Related commit:** 7992878

## Summary

Renamed the npm package scope from `@chen/openlog` to `@nk7260ynpa/openlog` across `package.json`, `package-lock.json`, and all references in `README.md`.

## Motivation / context

User instructed to change the package author/scope from `chen` to `nk7260ynpa` to align with their GitHub username.

## Key changes

- `package.json`: name `@chen/openlog` → `@nk7260ynpa/openlog`
- `package-lock.json`: name updated in both root and packages[""] entries
- `README.md`: 4 occurrences of `@chen/openlog` updated (stale symlink path, "not yet published" note, npm install, pnpm add)

## Impact

- Package identity changed. Anyone referencing the old `@chen/openlog` scope will need to update.
- No code or behavioral change.

## Verification

- `npm run build`: compiled successfully

## Follow-ups

- [ ] None
