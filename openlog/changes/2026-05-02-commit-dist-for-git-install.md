# Commit 預先 build 好的 dist/ 並讓 prepare 在 dist 存在時跳過

- **日期：** 2026-05-02
- **作者：** nk7260ynpa
- **相關 commit：** 尚未提交（將以本紀錄一同 commit 為 v0.3.5）

## 摘要

把預先 build 好的 `dist/` commit 進 repo，並讓 `build.js` 的 `prepare` 路徑在 `dist/cli/index.js` 已存在時直接 skip。這是繼 v0.3.4 嘗試後的真正修法：v0.3.4 把 `typescript` 升格到 `dependencies` 並沒有解決 `npm i -g github:...` 的 prepare 失敗，因為 npm 11 在 git-dep prepare 階段**完全不會在 clone temp 目錄裡裝任何 node_modules**（不論 deps 還是 devDeps）。本次同步把 `typescript` 與 `@types/node` 改回 `devDependencies` 以省下使用者端 ~70MB。版本 `0.3.4` → `0.3.5`。

## 動機 / 背景

v0.3.4 改動後，使用者再次 `npm i -g github:nk7260ynpa/Openlog`，依然失敗。新版 `build.js` 的 `error.stack` 輸出抓到真正錯誤：

```
Error: Cannot find module 'typescript/bin/tsc'
Require stack:
- /Users/chen/.npm/_cacache/tmp/git-cloneYvnIe1/build.js
```

對 npm 11 的 debug log 檢視後確認：

- npm 把 `@chen/openlog` 連同所有 dependencies（包括剛升格的 `typescript`）一律 placeDep 到「最終的全域目的地」（`~/.npm-global/lib/node_modules/@chen/openlog/node_modules/...`），而**不是** clone 出來的 `~/.npm/_cacache/tmp/git-cloneXXX/node_modules/`。
- `prepare` script 卻是在那個 temp clone 目錄底下執行的，因此 `require.resolve('typescript/bin/tsc')` 必然失敗——即使 `typescript` 是 `dependencies` 也一樣。
- 換句話說，把 deps 升格到 dependencies 沒有改善任何事，反而讓使用者多裝 ~70MB。

由於本套件目前只以 git URL 形式分發（CLAUDE.md 註明 `@chen` scope 尚未上 npm），git-URL 安裝是主要路徑。要繞過 npm 11 這個流程限制，最穩定的做法就是讓使用者端**完全不需要 build**：把預先 build 好的 `dist/` commit 進 repo，prepare 只在「真的沒有 dist」時才嘗試 build。

## 主要變更

- `.gitignore`：移除 `dist/` 條目，讓 `dist/` 進版控。
- `build.js:14-18`：在主流程開頭加入早退判斷——若 `npm_lifecycle_event === 'prepare'` 且 `dist/cli/index.js` 已存在，印 `Skipping build: dist/ already present (prepare hook).` 後 `process.exit(0)`。`npm run build` 因 `npm_lifecycle_event === 'build'` 不會 skip，仍會清空 dist 後重建。
- `package.json`：
  - `typescript ^5.9.3`、`@types/node ^24.2.0` 從 `dependencies` 移回 `devDependencies`。
  - 版本 `0.3.4` → `0.3.5`。
- `CLAUDE.md`：更新「建置流程」段落，說明 `dist/` 自 v0.3.5 起入版控，以及 prepare 的 skip 行為。
- `dist/`：commit 整個 `dist/` 目錄（72 個檔，共 312K）。

## 影響範圍

- **使用者面**：`npm i -g github:nk7260ynpa/Openlog`（含 `#v0.3.5`）會在 prepare 階段 skip，不再嘗試呼叫 `tsc`，安裝直接用 repo 內的 `dist/`。
- **開發者面**：
  - 開發流程多一條規矩——改 `src/` 後請手動 `npm run build` 重產 `dist/` 並一併 commit；prepare 不再會自動 build。
  - `npm install` / `pnpm install` 一律 skip prepare（因為 dist 一定存在），install 速度變快。
  - 若手動 `rm -rf dist/` 後 `npm install`，prepare 會 fallback 走實際 build 路徑（dev 環境有 devDeps，能跑通）。
- **體積**：使用者端全域安裝少約 70MB（typescript + @types/node 不再是 deps）。
- **無 breaking change**：CLI 行為與 API 沒改。

## 驗證

- `npm_lifecycle_event=prepare node build.js`（dist 存在）：顯示 `Skipping build: dist/ already present (prepare hook).` 然後 exit 0。
- `npm run build`：正常清空 dist 後重建，tsc 5.9.3，成功。
- `dist/` 共 72 檔 / 312K，不含 source map 以外的雜訊。
- 工作區乾淨後預期會有：`.gitignore`、`build.js`、`package.json`、`CLAUDE.md`、`dist/**`、新記錄檔。
- 尚未實機跑 `npm i -g github:nk7260ynpa/Openlog#v0.3.5` 驗證遠端安裝（push tag 後再請使用者驗證）。

## 後續工作

- [ ] push 後實機跑 `npm i -g github:nk7260ynpa/Openlog#v0.3.5`，確認 prepare 直接 skip 而非報錯。
- [ ] 若日後將套件正式發到 npm，`dist/` 會由 npm publish 流程從 tarball 提供，可考慮把 `dist/` 重新加回 `.gitignore`，但通常不建議——對於同時支援 git-URL 與 npm 安裝的套件，commit dist 是常見做法。
- [ ] 視情況加 CI 檢查：commit 時若 `src/` 有改動但 `dist/` 沒對應更新就警告。
- [ ] 使用者端若仍卡在舊 symlink 殘留（`~/.npm-global/lib/node_modules/@chen/openlog` 是 symlink），需先 `unlink` 才能正常裝；這是 npm 對 link → install 切換的固有問題，與本修法無關。
