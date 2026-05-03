# fix(test): Update skill-generation tests to include verify workflow

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 4f69204

## Summary

Fixed two assertion expected values in `test/core/shared/skill-generation.test.ts`, updating from `['apply', 'record', 'explore']` to `['apply', 'record', 'explore', 'verify']` to align with the previously added verify workflow registration, fixing the GitHub Actions CI failure.

## Motivation / context

When v0.5.6 added the `/oplg:verify` workflow, the verify entry was correctly registered in `src/core/shared/skill-generation.ts`, but the corresponding test expectations were not updated. This caused the CI pipeline's `npm test` step to fail on both the Node 20 and Node 22 matrix entries (2 tests failed / 40 passed).

## Key changes

- `test/core/shared/skill-generation.test.ts`: Added `'verify'` to the `toEqual` assertions on lines 13 and 31.

## Impact

- Fixes CI red status. No breaking change, no user-facing behavior impact.

## Verification

- `npm run build`: success
- `npm test`: 42/42 all passed
- `/oplg:verify` review result: PASS

## Follow-ups

- [ ] None
