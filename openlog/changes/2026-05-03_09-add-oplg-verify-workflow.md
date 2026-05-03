# feat: Add `/oplg:verify` read-only code review workflow

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 15d7b68

## Summary

Added a new `/oplg:verify` workflow that performs a read-only code review
scoped to the changes made by `/oplg:apply` in the current session. Unlike
a full PR review, it identifies session commits automatically and checks
correctness, security, code quality, type safety, error handling, and
README consistency, outputting a structured PASS/NEEDS_FIXES report.

## Motivation / context

The existing `/review` (from pr-review-toolkit) reviews an entire PR or
branch diff. Users needed a lighter-weight, session-scoped review that
specifically targets what `/oplg:apply` just changed — catching issues
before running `/oplg:record` or creating a PR.

## Key changes

- `src/core/templates/workflows/verify.ts`: new workflow template defining
  the skill and command for `/oplg:verify`
- `src/core/templates/index.ts`: re-export verify template functions
- `src/core/shared/skill-generation.ts`: register verify in both skill and
  command template arrays
- `README.md`: updated architecture tree, supported tools table, slash
  commands table, and roadmap
- `dist/`: rebuilt artifacts

## Impact

- New slash command `/oplg:verify` available after `openlog init --tools all`
- Generates `.claude/skills/openlog-verify/SKILL.md`,
  `.claude/commands/oplg/verify.md`, and
  `.github/prompts/oplg-verify.prompt.md`
- No breaking changes; additive only

## Verification

- `npm run build` passes (tsc compilation successful)
- `node bin/openlog.js init /tmp/openlog-verify-smoke --tools all` creates
  all three verify files
- Re-running init shows `[unchanged]` for all verify files (idempotent)

## Follow-ups

- [ ] Add unit tests for verify template generation
- [ ] Consider wiring `/oplg:verify` into the pipeline spec as an
  optional review gate between Stage 2 and Stage 3
