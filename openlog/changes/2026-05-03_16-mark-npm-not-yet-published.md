# docs: 標注 npm 尚未發佈，避免使用者誤裝

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 34ba4d4

## Summary

README.md 的 "After publishing to npm" 區段前加上 blockquote 說明 `@chen/openlog` 尚未發佈到 npm registry，避免使用者照做後遇到 404 錯誤。

## Motivation / context

`/oplg:explore` 調查發現 `npm view @chen/openlog` 回傳 404，但 README 中已列出 `npm install -g @chen/openlog@latest` 指引，缺乏「尚未發佈」的提示。

## Key changes

- `README.md`: 在 "After publishing to npm" 標題下方新增 blockquote，以 bold 標注 "Not yet published" 並說明待發佈後適用。

## Impact

- 純文件變更，不影響任何功能或 API。

## Verification

- `npm run build` 編譯通過。

## Follow-ups

- [ ] 正式發佈到 npm 後，移除此 blockquote 提示。
