# test: Add unit tests for verify workflow template

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 0814a40

## Summary

Added `test/core/templates/workflows/verify.test.ts`, directly testing the return values of `getVerifySkillTemplate` and `getOplgVerifyCommandTemplate`, covering name, description, read-only guardrail, verdict logic (PASS/NEEDS_FIXES), seven review aspects, default metadata, and consistency of skill instructions and command content sharing the same SHARED_BODY. Total test count increased from 42 to 53 (9 test files).

## Motivation / context

The follow-up in `2026-05-03_09-add-oplg-verify-workflow.md` explicitly listed "Add unit tests for verify template generation". The existing `skill-generation.test.ts` only tested the aggregation layer (workflow id lists and frontmatter output), lacking assertions on the verify template content itself.

## Key changes

- `test/core/templates/workflows/verify.test.ts`: Added 11 test cases, split into `getVerifySkillTemplate` (6 tests) and `getOplgVerifyCommandTemplate` (5 tests) describe blocks.

## Impact

- Increased test coverage. No breaking change, no user-facing behavior impact.

## Verification

- `npx vitest run`: 9 files, 53 tests, all passed (394 ms)
- `npm run build`: compiled successfully

## Follow-ups

- [ ] Consider adding equivalent template unit tests for the other three workflows (apply, record, explore)
