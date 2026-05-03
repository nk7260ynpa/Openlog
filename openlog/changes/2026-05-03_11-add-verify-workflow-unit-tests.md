# test: 為 verify workflow 模板補寫 unit tests

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 0814a40

## Summary

新增 `test/core/templates/workflows/verify.test.ts`，直接測試
`getVerifySkillTemplate` 與 `getOplgVerifyCommandTemplate` 兩個函式的回傳值，
涵蓋名稱、description、read-only guardrail、verdict 邏輯（PASS/NEEDS_FIXES）、
七項 review 面向、metadata 預設值，以及 skill instructions 與 command content
共用同一份 SHARED_BODY 的一致性。測試總數從 42 增加到 53（9 test files）。

## Motivation / context

`2026-05-03_09-add-oplg-verify-workflow.md` 的 follow-up 明確列出「Add unit
tests for verify template generation」。既有的 `skill-generation.test.ts` 只
測試聚合層（所有 workflow 的 id 列表與 frontmatter 產出），缺乏對 verify
模板內容本身的斷言。

## Key changes

- `test/core/templates/workflows/verify.test.ts`: 新增 11 個測試案例，
  分為 `getVerifySkillTemplate`（6 tests）和 `getOplgVerifyCommandTemplate`
  （5 tests）兩個 describe blocks。

## Impact

- 測試覆蓋率提升，無 breaking change，不影響任何 user-facing 行為。

## Verification

- `npx vitest run`: 9 files, 53 tests, all passed (394 ms)
- `npm run build`: 編譯通過

## Follow-ups

- [ ] 考慮為其他三個 workflow（apply, record, explore）補寫同等級的 template unit tests
