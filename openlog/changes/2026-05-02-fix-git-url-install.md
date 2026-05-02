# 修正 git-URL 全域安裝失敗並改善 build.js 錯誤輸出

- **日期：** 2026-05-02
- **作者：** nk7260ynpa
- **相關 commit：** 尚未提交（將以本紀錄一同 commit 為 v0.3.4）

## 摘要

把 `typescript` 與 `@types/node` 從 `devDependencies` 移至 `dependencies`，以解決使用者在 macOS / Node 25 / npm 11 下執行 `npm i -g github:nk7260ynpa/Openlog` 時 prepare 階段找不到 `tsc` 而 build 失敗的問題；同時在 `build.js` 的 catch 區塊補印 `error.stack`，避免之後 build 失敗只看到「❌ Build failed!」沒有任何上下文。並將版本號從 `0.3.3` 升至 `0.3.4`。

## 動機 / 背景

使用者實際遇到的錯誤鏈：

1. 第一次 `npm i -g github:nk7260ynpa/Openlog` 時撞到 `ENOTDIR: rename` 錯誤，原因是 `~/.npm-global/lib/node_modules/@chen/openlog` 是先前 `npm link` 留下的 symlink，npm 想把它當資料夾備份所以失敗。
2. 解開 symlink 後重裝，改撞到 `prepare` script 的 `node build.js` 失敗，錯誤訊息僅有 `❌ Build failed!`，無法判斷原因。
3. 比對本地 `git clone` + `npm install` 卻能正常 build，差異在於 npm 11 在做 `npm i -g <git-url>` 時，雖然內部命令帶了 `--include=dev`，實際 prepare 環境裡 devDependencies 並沒有完整安裝進去，導致 `require.resolve('typescript/bin/tsc')` 找不到 typescript 套件。

由於本套件目前僅以 git URL 形式分發（CLAUDE.md 註明 `@chen` scope 尚未上 npm），prepare 一定會在使用者端跑 `tsc`。最直接、最低風險的做法就是把 build-time 必要的 `typescript` 與 `@types/node` 升格為一般 `dependencies`，確保 prepare 環境一定裝得到。

`build.js` 原本的 catch 把 error 整個吞掉只印一行訊息，未來若 build 真的失敗（例如 TS 編譯錯誤、tsconfig 損壞），開發者完全無從下手，因此一併補上 stack 輸出。

## 主要變更

- `package.json`：
  - 移除 `devDependencies` 區塊。
  - 將 `typescript ^5.9.3` 與 `@types/node ^24.2.0` 併入 `dependencies`，並依字母序排列。
  - 版本 `0.3.3` → `0.3.4`。
- `build.js:28`：catch 區塊新增 `console.error(error.stack || error.message || String(error))`，確保 build 失敗時可看到實際錯誤。

## 影響範圍

- **使用者面**：以 `npm i -g github:nk7260ynpa/Openlog` 安裝可正常通過 prepare；本地 `npm i -g .` 不受影響。
- **體積**：全域安裝時會多裝 typescript（約 70MB）與 @types/node。對 CLI 套件來說可接受，但若日後正式發布到 npm 並把預先 build 好的 `dist/` 包進 tarball，可考慮把這兩個依賴改回 devDependencies。
- **行為**：CLI 執行時行為完全沒變；改的是安裝期的 build 流程。
- **無 breaking change**。

## 驗證

- `npm run build`：通過（tsc 5.9.3，dist 重建成功）。
- `package.json` 結構檢查：`dependencies` 含 6 個套件（含 `typescript`、`@types/node`），`devDependencies` 已清空。
- 工作區乾淨，僅本次預期內的 3 個檔案異動（`package.json`、`build.js`、新增的紀錄檔）。
- 尚未實機跑 `npm i -g github:...` 驗證遠端安裝（需先 push tag 才有意義；commit + push 後再請使用者驗證）。

## 後續工作

- [ ] push 後實機跑 `npm i -g github:nk7260ynpa/Openlog#v0.3.4`，確認 prepare 階段不再失敗。
- [ ] 若日後將套件正式發布到 npm（並在 tarball 內附 `dist/`），把 `typescript` 與 `@types/node` 改回 `devDependencies` 以縮減使用者端體積。
- [ ] 視情況在 README 補一段「git-URL 安裝注意事項」說明 prepare 流程依賴 typescript。
