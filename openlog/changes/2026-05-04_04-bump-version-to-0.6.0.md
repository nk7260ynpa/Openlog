# chore(release): v0.6.0

- **Date:** 2026-05-04
- **Author:** nk7260ynpa
- **Related commit:** 7606fea

## Summary

Bumped package version from 0.5.9 to 0.6.0. This minor release includes
the new automatic `openlog validate` step added to the `/oplg:record`
workflow template.

## Motivation / context

The `/oplg:record` workflow gained a new validate step, which is a
feature-level change warranting a minor version bump per semver.

## Key changes

- `package.json`: version 0.5.9 → 0.6.0

## Impact

- `openlog --version` now reports `0.6.0`.
- `openlog update --check` will see v0.6.0 as the latest.
- No breaking changes.

## Verification

- `pnpm run build` — compiled cleanly.

## Follow-ups

- None.
