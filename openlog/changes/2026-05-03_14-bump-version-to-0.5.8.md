# chore(release): v0.5.8

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 1aab227

## Summary

版本從 0.5.7 升至 0.5.8，涵蓋本次 session 的所有變更：verify workflow unit
tests、PR-triggered CI check、vitest coverage reporting。

## Motivation / context

本次 session 完成了多項 follow-up 改善（測試、CI、coverage），打包為一個
新的 patch 版本。使用者指示先升版但不打 tag。

## Key changes

- `package.json`: version 0.5.7 → 0.5.8
- `package-lock.json`: version 同步更新

## Impact

- 版本號更新，無 breaking change。
- 尚未打 tag，全域安裝仍指向 main branch HEAD。

## Verification

- `npm run build`: 編譯通過，輸出顯示 `@chen/openlog@0.5.8`
- `npm test`: 53/53 tests passed

## Follow-ups

- [ ] 無
