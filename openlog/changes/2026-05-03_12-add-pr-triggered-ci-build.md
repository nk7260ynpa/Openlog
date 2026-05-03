# ci: 新增 PR-triggered build-only CI check

- **Date:** 2026-05-03
- **Author:** nk7260ynpa
- **Related commit:** 06dd08d

## Summary

在 `.github/workflows/ci.yml` 新增 `pull_request` trigger（目標 `main`
分支），對應一個只跑 `npm ci` + `npm run build` 的 `build` job（Node 20/22
matrix）。原有的 tag push 觸發（build + test）以 `if: github.event_name ==
'push'` 條件保留不變。

## Motivation / context

`2026-05-03_08-add-github-actions-ci.md` 的 follow-up 建議「Consider adding
a PR-triggered lighter check (build-only, no test) if the team wants pre-merge
validation」。此變更實現該建議，讓 PR 在合併前有基本的型別編譯驗證，同時
避免在每個 PR 都跑完整測試套件。

## Key changes

- `.github/workflows/ci.yml`: 新增 `pull_request` trigger 與 `build` job；
  為既有 `build-and-test` job 加上 `if: github.event_name == 'push'` 條件。
- `README.md`: CI 描述從 "runs on tag push" 更新為 "build on PR, build + test
  on tag push"。

## Impact

- PR 開啟或更新時自動觸發編譯檢查，提供 pre-merge 品質關卡。
- 原有的 tag push CI 行為不變。

## Verification

- YAML 語法手動檢查通過。
- `npm run build`: 編譯通過。

## Follow-ups

- [ ] 無
