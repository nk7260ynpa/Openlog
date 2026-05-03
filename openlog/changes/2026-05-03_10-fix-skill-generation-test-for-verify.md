# fix(test): 更新 skill-generation 測試以包含 verify workflow

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 4f69204

## Summary

修正 `test/core/shared/skill-generation.test.ts` 中兩處 assertion 的期望值，從 `['apply', 'record', 'explore']` 更新為 `['apply', 'record', 'explore', 'verify']`，使測試與先前新增的 verify workflow 註冊保持一致，修復 GitHub Actions CI 失敗。

## Motivation / context

v0.5.6 新增 `/oplg:verify` workflow 時，已在 `src/core/shared/skill-generation.ts` 正確註冊了 verify，但遺漏更新對應的測試期望值。導致 CI pipeline 的 `npm test` 階段在 Node 20 與 Node 22 兩個 matrix 均失敗（2 tests failed / 40 passed）。

## Key changes

- `test/core/shared/skill-generation.test.ts`: 第 13 行與第 31 行的 `toEqual` assertion 加入 `'verify'`

## Impact

- 修復 CI 紅燈，無 breaking change，不影響任何 user-facing 行為。

## Verification

- `npm run build`：成功
- `npm test`：42/42 全數通過
- `/oplg:verify` 審查結果：PASS

## Follow-ups

- [ ] 無
