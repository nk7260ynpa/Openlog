# feat(record): Replace spec sync guidance in /oplg:record with six specific trigger conditions

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 0862e80

## Summary

Based on the OpenSpec schema's spec-level behavior criteria, replaced the generic guidance ("update or add a spec when the implementation diverges") in `/oplg:record` Step 4 with six positively enumerated trigger conditions and negative exclusions, giving the AI a concrete checklist to decide whether `openlog/specs/` needs updating when recording changes.

## Motivation / context

A prior `/oplg:explore` investigation found a fundamental difference between OpenSpec and Openlog in when specs are written — the former designs upfront, the latter records after the fact. Openlog's `/oplg:record` had only a single vague guidance line, and with `openlog/specs/` containing just one spec at the time, that guidance was almost never triggered in practice. By extracting criteria from the OpenSpec schema (`schema.yaml:17`) and Verifier (`verifier.md:90-101`) and translating them into Openlog CLI context, the spec sync quality of `/oplg:record` is strengthened.

## Key changes

- `src/core/templates/workflows/record.ts`: Expanded the single-line guidance at line 98 into six positive trigger conditions (CLI flag add/remove, API contract change, cross-workflow invariant, spec drift, capability deprecation, breaking change) plus negative exclusions (internal refactoring, performance optimization, dependency upgrades, bug fixes restoring original behavior, and test-only changes do not trigger).
- `dist/core/templates/workflows/record.js`: Corresponding compiled output.

## Impact

- Affects all `/oplg:record` behavior installed via `openlog init` — newly initialized projects will receive more specific spec sync conditions.
- No impact on CLI flags, install steps, or public API. No breaking change.

## Verification

- `pnpm run build` (`tsc`) compiled successfully, no type errors.
- Manually confirmed `dist/` output matches `src/` template content.

## Follow-ups

- [x] Update `openlog/specs/oplg-pipeline-contract.md` Stage 3 MUST section to reflect the new six trigger conditions — completed in spec rev. 3 (lines 142-161).
