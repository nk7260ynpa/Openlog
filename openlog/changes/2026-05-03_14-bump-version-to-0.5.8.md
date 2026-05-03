# chore(release): v0.5.8

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 1aab227

## Summary

Bumped version from 0.5.7 to 0.5.8, covering all changes from this session: verify workflow unit tests, PR-triggered CI check, and vitest coverage reporting.

## Motivation / context

This session completed several follow-up improvements (tests, CI, coverage), packaged as a new patch version. User instructed to bump version but not create a tag.

## Key changes

- `package.json`: version 0.5.7 → 0.5.8
- `package-lock.json`: version synced

## Impact

- Version number update, no breaking change.
- No tag created yet; global install still points to main branch HEAD.

## Verification

- `npm run build`: compiled successfully, output shows `@nk7260ynpa/openlog@0.5.8`
- `npm test`: 53/53 tests passed

## Follow-ups

- [ ] None
