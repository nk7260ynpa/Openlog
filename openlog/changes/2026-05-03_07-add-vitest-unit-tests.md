# test: Add Vitest unit test framework with 42 tests

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 607f695

## Summary

Introduced Vitest as the project's first test framework and wrote 42 unit
tests across 8 test files covering every testable module. The
`compareVersions` helper in `update.ts` was exported to enable direct
testing.

## Motivation / context

The project previously had no test runner — the only verification step was
`tsc` via `node build.js`. Adding unit tests is a prerequisite for a CI
pipeline and catches regressions that type-checking alone cannot surface.

## Key changes

- `package.json`: added `vitest` devDependency, `test` and `test:watch`
  scripts.
- `vitest.config.ts`: minimal config pointing at `test/**/*.test.ts`.
- `src/core/update.ts`: exported `compareVersions` for direct testing.
- `test/core/config.test.ts`: tests for `AI_TOOLS` and `findToolByValue`.
- `test/core/update.test.ts`: tests for `compareVersions` (semver
  comparisons, `v` prefix, pre-release suffix, unequal segment lengths).
- `test/core/init.test.ts`: integration tests using temp directories —
  covers `--tools none/claude/github-copilot/all`, idempotency, `--force`,
  error handling, and auto-creation of missing target paths.
- `test/core/shared/skill-generation.test.ts`: tests for template
  retrieval and `generateSkillContent` output.
- `test/core/command-generation/generator.test.ts`: tests for
  `generateCommand` and `generateCommands` with a fake adapter.
- `test/core/command-generation/registry.test.ts`: tests for
  `CommandAdapterRegistry` lookups.
- `test/core/command-generation/adapters/claude.test.ts`: tests for path
  generation and YAML escaping in the Claude adapter.
- `test/core/command-generation/adapters/github-copilot.test.ts`: tests
  for path generation and Copilot-specific frontmatter.
- `README.md`: added `npm test` / `npm run test:watch` to Development
  commands table.

## Impact

- All existing modules unaffected (only addition of test files and one
  minor export).
- `dist/` rebuilt to include the exported `compareVersions` signature.
- No breaking changes.

## Verification

- `npx vitest run`: 8 files, 42 tests, all passed (298 ms).
- `node build.js`: compiled successfully.

## Follow-ups

- [ ] Consider adding coverage reporting (`vitest --coverage`).
