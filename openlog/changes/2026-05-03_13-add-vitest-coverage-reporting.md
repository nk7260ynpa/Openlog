# test: Configure vitest V8 coverage reporting

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 3230b66

## Summary

Installed `@vitest/coverage-v8` as a devDependency, configured the V8 coverage provider in `vitest.config.ts` (scope: `src/**/*.ts`, output: `text` + `lcov`), and added a `test:coverage` script (`vitest run --coverage`) to `package.json`.

## Motivation / context

The follow-up in `2026-05-03_07-add-vitest-unit-tests.md` suggested "Consider adding coverage reporting (`vitest --coverage`)". With coverage reporting in place, test coverage can be quantified and future work can set coverage thresholds or integrate CI coverage badges.

## Key changes

- `package.json`: Added `@vitest/coverage-v8` devDependency and `test:coverage` script
- `vitest.config.ts`: Added `coverage` block (provider: v8, include: src/**/*.ts, reporter: text + lcov)
- `README.md`: Added `npm run test:coverage` row to the Development commands table

## Impact

- Developers can generate coverage reports with `npm run test:coverage`.
- Does not affect existing `npm test` (runs without coverage).
- Initial coverage: Statements 61.94%, Branches 51.03%, Functions 67.12%, Lines 61.65%.

## Verification

- `npm run test:coverage`: 53 tests passed, coverage report generated successfully
- `npm run build`: compiled successfully

## Follow-ups

- [ ] Consider adding coverage report upload to CI (e.g. Codecov)
- [ ] Consider setting coverage thresholds to prevent regression
