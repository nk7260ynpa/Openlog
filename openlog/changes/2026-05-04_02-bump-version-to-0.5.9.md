# chore(release): v0.5.9

- **Date:** 2026-05-04
- **Author:** nk7260ynpa
- **Related commit:** c99c897

## Summary

Bumped version from 0.5.8 to 0.5.9 and tagged the release. This patch
release includes the new `openlog validate` subcommand added earlier in
the same session.

## Motivation / context

The `openlog validate` feature was complete and pushed; a version tag was
needed to mark the release point for `openlog update --ref` consumers.

## Key changes

- `package.json`: version 0.5.8 → 0.5.9
- `dist/`: rebuilt artifacts reflecting the new version string
- Git tag `v0.5.9` created and pushed

## Impact

- `openlog --version` now reports `0.5.9`.
- `openlog update --check` will see v0.5.9 as the latest.
- No breaking changes.

## Verification

- `pnpm run build` — compiled cleanly.
- `git tag v0.5.9` + `git push origin v0.5.9` — tag visible on remote.

## Follow-ups

- None.
