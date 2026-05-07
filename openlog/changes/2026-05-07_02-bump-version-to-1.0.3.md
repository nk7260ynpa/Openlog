# chore(release): 版本更新至 v1.0.3

- **Date:** 2026-05-07
- **Author:** nk7260ynpa
- **Related commit:** d345922

## Summary

將 `package.json` 版本從 1.0.2 更新至 1.0.3，對應本次 workflow 模板精簡的 patch release。

## Motivation / context

完成 workflow 模板精簡後，以 patch 版本發布此變更。

## Key changes

- `package.json`: version 1.0.2 → 1.0.3

## Impact

使用者透過 `openlog update` 更新後將取得精簡後的模板。

## Verification

- `node build.js` 編譯通過
