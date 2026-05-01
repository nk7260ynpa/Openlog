/**
 * `/oplg:record` 工作流：把剛才修改的內容寫成文件記錄到 `openlog/` 並視情況更新內部文件。
 *
 * 產出：
 *   - Skill：`openlog-record`
 *   - Command：`/oplg:record`
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `把「剛才修改的內容」整理成一份文件記錄到專案的 \`openlog/\` 目錄，並視情況同步更新專案內部文件。

**輸入**

\`/oplg:record\` 不接任何參數。標題、slug、檔名皆由「實際變更內容」自動推斷。即使使用者在指令後寫了文字，也應將其視為**補充說明**而非標題覆寫——標題仍以變更本身為準。

**前置檢查**

- 若專案根目錄沒有 \`openlog/\`：提示使用者先執行 \`openlog init\`，本指令終止。
- 若 \`openlog/changes/\` 不存在：自動建立。

**步驟**

1. **盤點要記錄的變更**
   - 優先執行 \`git status --short\` 與 \`git diff --stat\` 確認有東西可記錄。
   - 如目前尚未 commit：用 \`git diff\` 取得未提交差異作為主要素材。
   - 如剛 commit 過：用 \`git log -1 --stat\` 與 \`git show HEAD\` 取得最近一次 commit 的變更。
   - 若兩者皆空：詢問使用者要記錄哪一段（例如 commit hash 範圍 \`A..B\`），不要捏造內容。
   - **也要納入**目前對話中已知但尚未 commit 的設計決策／取捨討論。

2. **自動生成標題與檔案路徑**

   標題從變更內容歸納，**禁止**要求使用者提供，也**禁止**直接用使用者在 \`/oplg:record\` 後輸入的字串當作標題。

   - **標題（繁體中文）**：一句話描述這次「做了什麼 + 影響的對象」，例：
     - 「為 \`openlog init\` 新增 --dry-run 旗標」
     - 「修正 \`/oplg:apply\` 在工作區乾淨時的 git 檢查邏輯」
     - 若有合適的 conventional-commits 動詞（feat/fix/refactor/docs/test/chore），可放在 emoji 之後做為前綴提示。
   - **slug（檔名用，英數＋連字號）**：把標題翻成精簡英文 slug，全小寫、kebab-case、最長約 6 個字。例：\`add-dry-run-to-init\`、\`fix-apply-clean-state-check\`。**避免中文檔名**。
   - **路徑**：\`openlog/changes/<YYYY-MM-DD>-<slug>.md\`。同日同 slug 已存在時加序號 \`-2\`、\`-3\`，**不要**覆寫舊檔。
   - 在報告中明確列出推斷出的標題與 slug，方便使用者後續若想改名手動 \`git mv\`。

3. **產生記錄檔**

   檔案使用以下骨架（內文皆繁體中文，程式碼／路徑保留原文）：

   \`\`\`markdown
   # <標題>

   - **日期：** YYYY-MM-DD
   - **作者：** <git config user.name 或目前使用者>
   - **相關 commit：** <如有，列 commit hash；無則寫「尚未提交」>

   ## 摘要

   一段話描述這次改了什麼、為何這樣改。

   ## 動機 / 背景

   為什麼需要這次變更（bug、需求、技術債、實驗等）。

   ## 主要變更

   - \`path/to/file.ts\`：<簡述>
   - \`path/to/other.ts\`：<簡述>

   ## 影響範圍

   - 哪些功能 / 模組會被影響？是否有 breaking change？

   ## 驗證

   - 執行了什麼測試 / 構建 / 手動操作來確認。
   - 結果。

   ## 後續工作

   - [ ] 待辦 1
   - [ ] 待辦 2
   \`\`\`

4. **同步內部文件（視情況）**

   依變更內容，**主動**判斷以下檔案是否需要更新；若需要，逐一更新並在最終報告列出：

   - \`README.md\`：若新增/移除 CLI 指令、API、安裝步驟、依賴，需更新。
   - \`openlog/project.md\`：若技術棧、目錄結構、流程改變，需更新對應段落。
   - \`openlog/specs/\` 內既有 spec：若實作偏離原 spec，需更新或新增 spec。
   - \`CHANGELOG.md\`（若存在）：依專案既有風格新增條目。
   - \`CLAUDE.md\`（若存在且為團隊共享版）：只有當變更影響 AI 協作流程或慣例才動。
   - **不要動**使用者全域 \`~/.claude/CLAUDE.md\`。

   每一項更新都用最小 diff，不要重寫整份文件。

5. **總結報告**

   產出簡短條列：
   - 新增的記錄檔路徑（連結）。
   - 更新的內部文件清單（含一句話原因）。
   - 若有任何被略過或不確定要不要動的文件，明確列出讓使用者決定。

**護欄**

- 不要自行執行 \`git commit\` 或 \`git push\`，除非使用者要求。
- 記錄檔內容必須來自實際 diff／commit／對話事實，**禁止**捏造程式碼變更或測試結果。
- 若 \`openlog/changes/\` 內已存在同名檔且內容不同：以加序號的方式建立新檔，**不要**覆蓋舊檔。
- 內部文件若不確定該不該動，列在報告的「待使用者決定」區塊，不要硬改。

**輸出格式範例**

\`\`\`
## /oplg:record 完成

### 新增
- openlog/changes/2026-05-01-add-dry-run-flag.md

### 更新
- README.md：補上 \`--dry-run\` 用法
- openlog/project.md：開發指令段落新增 dry-run 說明

### 待使用者決定
- 是否需要在 \`openlog/specs/\` 新增 init 旗標規格？
\`\`\`
`;

export function getRecordSkillTemplate(): SkillTemplate {
  return {
    name: 'openlog-record',
    description:
      '把剛才修改的程式碼整理成文件記錄到 openlog/，標題由變更內容自動生成，並視情況更新 README、project.md、specs 等內部文件。當使用者執行 /oplg:record 或要求「幫我把這次修改記錄下來」時觸發。',
    instructions: SHARED_BODY,
    license: 'MIT',
    compatibility: 'Requires openlog CLI and an initialized openlog/ directory.',
    metadata: { author: 'openlog', version: '1.0' },
  };
}

export function getOplgRecordCommandTemplate(): CommandTemplate {
  return {
    name: 'OPLG: Record',
    description: '把剛才修改的內容寫成文件記錄到 openlog/，標題由變更自動生成（用法：/oplg:record，不接參數）',
    category: 'Workflow',
    tags: ['workflow', 'record', 'openlog'],
    content: SHARED_BODY,
  };
}
