# feat(record): 將 /oplg:record 的 spec 同步指引替換為六項具體觸發條件

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 0862e80

## Summary

參考 OpenSpec schema 的 spec-level behavior 判斷準則，將 `/oplg:record`
Step 4 原本的泛用指引（"update or add a spec when the implementation
diverges"）替換為正面列舉六項具體觸發條件與反面排除項，讓 AI 在記錄
變更時有明確的 checklist 判斷是否需要更新 `openlog/specs/`。

## Motivation / context

先前的 `/oplg:explore` 調查發現 OpenSpec 與 Openlog 在撰寫 spec 的時機
上有根本差異——前者事前設計、後者事後記錄。Openlog 的 `/oplg:record`
只有一句模糊指引，加上 `openlog/specs/` 長期只有一份 spec，該指引幾乎
從未被實質觸發。藉由從 OpenSpec 的 schema（`schema.yaml:17`）與
Verifier（`verifier.md:90-101`）萃取判斷準則，轉譯成 Openlog CLI 語境
下的具體條件，強化 `/oplg:record` 的 spec 同步品質。

## Key changes

- `src/core/templates/workflows/record.ts`: 將第 98 行的單句指引展開為
  六項正面觸發條件（CLI flag 增刪、API contract 變動、cross-workflow
  invariant、spec drift、capability 廢棄、breaking change）加上反面
  排除項（內部重構、效能優化、依賴升級、修回原行為的 bug fix、純測試
  變更不觸發）。
- `dist/core/templates/workflows/record.js`: 對應的編譯產出。

## Impact

- 影響所有透過 `openlog init` 安裝的 `/oplg:record` 行為——新安裝的
  專案會拿到更具體的 spec 同步判斷條件。
- 不影響 CLI flags、安裝步驟或 public API，無 breaking change。

## Verification

- `pnpm run build`（`tsc`）編譯通過，無型別錯誤。
- 手動確認 `dist/` 產出的模板內容與 `src/` 一致。

## Follow-ups

- [ ] 更新 `openlog/specs/oplg-pipeline-contract.md` Stage 3 MUST 區段以反映新的六項觸發條件（本次 `/oplg:record` 的 Step 4 同步）。
