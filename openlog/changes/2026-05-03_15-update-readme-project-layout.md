# docs: 更新 README Project layout 樹狀圖

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** d1d8576

## Summary

README.md 的 Project layout 樹狀圖先前只列出代表性檔案，遺漏了多個實際存在的模組。此次補齊 `command-generation/` 下的 `generator.ts`、`types.ts`、`registry.ts`，`shared/` 下的 `skill-generation.ts`、`tool-detection.ts`，以及 `test/` 目錄和 `vitest.config.ts`。

## Motivation / context

`/oplg:explore` 調查發現樹狀圖與實際檔案結構不一致，對新讀者可能產生誤導——尤其是 Development commands 區段列出了 `npm test` 等指令，但樹狀圖中完全看不到 `test/` 目錄的存在。

## Key changes

- `README.md`: Project layout 樹狀圖新增 9 行，補上 `command-generation/` 內部模組、`shared/` 子檔案、`test/` 目錄、`vitest.config.ts`。

## Impact

- 純文件變更，不影響任何功能或 API。

## Verification

- `npm run build` 編譯通過。
- 樹狀圖中每個新增路徑均經 `/oplg:verify` 確認實際存在於磁碟。

## Follow-ups

- [ ] 樹狀圖中 `test/core/` 註解寫 "9 test files"，未來測試增加時需同步更新數字。
