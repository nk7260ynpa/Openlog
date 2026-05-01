/**
 * `/oplg:apply` 工作流：依使用者敘述的動作直接修改程式碼。
 *
 * 產出：
 *   - Skill：`openlog-apply`，會在使用者請求修改程式碼或執行 `/oplg:apply` 時自動觸發。
 *   - Command：`/oplg:apply <action>`，由使用者明確啟動。
 */

import type { SkillTemplate, CommandTemplate } from '../types.js';

const SHARED_BODY = `從使用者輸入中讀取「要執行的動作」（自由文字，例：\`/oplg:apply 為 init 加上 --dry-run\`）並直接修改程式碼。

**輸入**

\`/oplg:apply <action>\` 後接的全部文字即為「動作敘述」。若敘述為空或極度模糊（例如僅為 \`fix\` 一個字），**必須**用 AskUserQuestion 詢問使用者要做什麼，再進入後續步驟。

**步驟**

1. **解讀動作**
   - 將動作敘述轉成具體的編輯計畫：要動哪些檔、加什麼/改什麼/刪什麼、是否需要新測試。
   - 若敘述包含多項任務，先在回覆中條列計畫並逐項執行。
   - 若動作牽涉本機未啟用的依賴或外部服務，先檢查是否可繼續；不能則停下來回報。

2. **盤點現況**
   - 執行 \`git status --short\` 與 \`git diff --stat\` 了解目前是否有未提交變更，避免覆蓋使用者在途中的修改。
   - 若工作區「乾淨」：直接開始修改。
   - 若工作區已有未提交變更：先簡短列出已存在的變更摘要，再執行；除非使用者要求才丟棄既有變更。

3. **修改程式碼**
   - 使用 Read → Edit/Write 編輯需要動的檔。
   - 範圍最小化：只動跟動作敘述相關的檔，不要順便重構其他地方。
   - 註解與訊息使用繁體中文（除非該檔既有風格為英文）。
   - 若任務需要新測試或需要更新既有測試，**也要在這一步完成**。

4. **本地驗證**
   - 若專案有可快速跑的檢查指令（如 \`pnpm run build\`、\`npm test\`、\`pytest\`、\`tsc --noEmit\`），執行最相關的一個。
   - 構建/測試失敗時：先嘗試修正；連續修不好就停下來把錯誤完整貼給使用者，不要硬塞 workaround。

5. **總結報告**
   - 用簡短條列說明：
     - 改了哪些檔（含路徑）
     - 為什麼這樣改
     - 還有什麼建議的後續動作（例如使用者該手動跑 e2e、或還有 TODO 要追）
   - 結尾建議：若需要把這次修改記錄成文件，可執行 \`/oplg:record\`。

**護欄**

- 不要自動執行任何破壞性 git 動作（reset --hard、push --force、刪分支）。Commit 前要先確認，除非使用者要求。
- 不要碰任務範圍以外的檔（例如沒被指定卻順手改 README、CLAUDE.md、settings.json 等）；若發現需要也要動，請在報告中說明並讓使用者決定。
- 嚴禁在最終 commit 留 \`TODO\` / \`FIXME\` / \`HACK\` 等佔位符（除非動作本身就是要新增 TODO）。
- 動作敘述若風險過高（刪除大量檔案、覆蓋資料、改動 CI/CD pipeline、處理機密），**先停下來確認**再動手。

**輸出格式範例**

\`\`\`
## /oplg:apply 完成

**動作：** <action 摘要>

### 變更
- src/foo.ts: 加入 X 行為
- tests/foo.test.ts: 補上對 X 的測試

### 驗證
- \`pnpm run build\`：通過
- \`pnpm test\`：通過 (12 passed)

### 後續建議
- 如需記錄此次修改，請執行 \`/oplg:record\`。
\`\`\`
`;

export function getApplySkillTemplate(): SkillTemplate {
  return {
    name: 'openlog-apply',
    description:
      '依使用者敘述的動作直接修改專案程式碼。當使用者執行 /oplg:apply 或要求「幫我把 X 改成 Y / 加上 Z / 修掉這個 bug」時觸發。',
    instructions: SHARED_BODY,
    license: 'MIT',
    compatibility: 'Requires openlog CLI.',
    metadata: { author: 'openlog', version: '1.0' },
  };
}

export function getOplgApplyCommandTemplate(): CommandTemplate {
  return {
    name: 'OPLG: Apply',
    description: '依使用者敘述直接修改程式碼（用法：/oplg:apply <要執行的動作>）',
    category: 'Workflow',
    tags: ['workflow', 'apply', 'openlog'],
    content: SHARED_BODY,
  };
}
