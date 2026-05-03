# test: 設定 vitest V8 coverage reporting

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 3230b66

## Summary

安裝 `@vitest/coverage-v8` 作為 devDependency，在 `vitest.config.ts` 設定
V8 coverage provider（scope 為 `src/**/*.ts`，輸出 `text` + `lcov` 格式），
並在 `package.json` 新增 `test:coverage` script（`vitest run --coverage`）。

## Motivation / context

`2026-05-03_07-add-vitest-unit-tests.md` 的 follow-up 建議「Consider adding
coverage reporting (`vitest --coverage`)」。有了 coverage 報告，可以量化測試
覆蓋率並在未來設定 coverage threshold 或整合 CI coverage badge。

## Key changes

- `package.json`: 新增 `@vitest/coverage-v8` devDependency 與 `test:coverage` script
- `vitest.config.ts`: 新增 `coverage` 區塊（provider: v8, include: src/**/*.ts,
  reporter: text + lcov）
- `README.md`: Development commands 表新增 `npm run test:coverage` 列

## Impact

- 開發者可用 `npm run test:coverage` 產出 coverage 報告。
- 不影響既有的 `npm test`（不帶 coverage）。
- 初始 coverage：Statements 61.94%, Branches 51.03%, Functions 67.12%, Lines 61.65%。

## Verification

- `npm run test:coverage`: 53 tests passed, coverage 報告正常產出
- `npm run build`: 編譯通過

## Follow-ups

- [ ] 考慮在 CI 中加入 coverage 報告上傳（如 Codecov）
- [ ] 考慮設定 coverage threshold 防止覆蓋率下降
