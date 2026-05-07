# refactor(templates): 精簡四個 workflow 模板，總行數 -35%

- **Date:** 2026-05-07
- **Author:** nk7260ynpa
- **Related commit:** a8c6ee8

## Summary

為 explore / record / verify / apply 四個 workflow 模板加入「Output rules」簡潔指令，消除重複的 guardrails 與 output discipline 敘述，並將無內容 section 標記為條件式（omit if none）。模板指示總行數從 386 降至 252（-35%）。

## Motivation / context

使用者反映 `/oplg:*` workflow 的 AI 回應過於冗長。根源分析顯示約 60% 的模板文字是重複的行為管控指示，且缺乏任何簡潔性約束，導致 AI 逐 section 填充即使無內容也硬寫。計畫採三管齊下：加簡潔指令、去重複、條件式 section。

## Key changes

- `src/core/templates/workflows/explore.ts`: 加 Output rules，合併 guardrails + output discipline，刪 When-to-call 區塊，section 條件化（-26%）
- `src/core/templates/workflows/record.ts`: 加 Output rules，合併重複 title 規則與 openlog-only 邊界，精簡 output format example（-58%）
- `src/core/templates/workflows/verify.ts`: 加 Output rules，精簡 review aspects（7→3 項），section 條件化（-22%）
- `src/core/templates/workflows/apply.ts`: 加 Output rules（+5 行，本身已精簡）

## Impact

所有 `/oplg:*` workflow 的 AI 輸出應更簡潔。模板輸出格式有變（section 變為條件式），但語意不變、不影響使用者操作。

## Verification

- `node build.js` 編譯通過
- `node bin/openlog.js init /tmp/openlog-concise-test --tools all` 煙霧測試通過
- 新舊行數比較確認 386 → 252
