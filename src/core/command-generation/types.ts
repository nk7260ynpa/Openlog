/**
 * 各 AI 工具中立的 slash command 結構與轉換 adapter 介面。
 *
 * 設計沿用 OpenSpec：
 *   - `CommandContent` 描述「要產什麼」（與工具無關）。
 *   - `ToolCommandAdapter` 描述「某個工具要怎麼擺、怎麼包 frontmatter」。
 */

export interface CommandContent {
  /**
   * Command 識別碼（如 `apply`、`record`）。
   */
  id: string;
  /**
   * 顯示名稱（如 `OPLG: Apply`）。
   */
  name: string;
  /**
   * 一句話描述。
   */
  description: string;
  /**
   * 分類（如 `Workflow`）。
   */
  category: string;
  /**
   * 標籤陣列。
   */
  tags: string[];
  /**
   * Slash command 的主體內容。
   */
  body: string;
}

export interface ToolCommandAdapter {
  /**
   * 對應 `AIToolOption.value`（如 `claude`、`github-copilot`）。
   */
  toolId: string;
  /**
   * 回傳此工具該 command 在專案根目錄下的相對路徑。
   *
   * 例：claude 為 `.claude/commands/oplg/<id>.md`。
   */
  getFilePath(commandId: string): string;
  /**
   * 將工具中立內容格式化為對應工具的最終檔案內容（含 frontmatter）。
   */
  formatFile(content: CommandContent): string;
}

export interface GeneratedCommand {
  /**
   * 從專案根開始的相對路徑（或絕對路徑，視 adapter 而定）。
   */
  path: string;
  /**
   * 完整檔案內容。
   */
  fileContent: string;
}
