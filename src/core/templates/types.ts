/**
 * Skill 與 slash command 的核心型別。
 *
 * - `SkillTemplate`：產生 `.claude/skills/<dirName>/SKILL.md`
 * - `CommandTemplate`：產生各 AI 工具的 slash command 檔（如 `.claude/commands/oplg/<id>.md`）
 */

export interface SkillTemplate {
  /**
   * Skill 的識別名稱（會寫入 frontmatter 的 `name` 欄位，建議用 kebab-case）。
   */
  name: string;
  /**
   * 一句話描述 skill 的觸發時機與功能。
   */
  description: string;
  /**
   * Skill 的主體指令內容（Markdown）。
   */
  instructions: string;
  /**
   * 授權字串，預設 'MIT'。
   */
  license?: string;
  /**
   * 相容性說明，預設 'Requires openlog CLI.'。
   */
  compatibility?: string;
  /**
   * 額外 metadata，例如 `author` 與 `version`。
   */
  metadata?: Record<string, string>;
}

export interface CommandTemplate {
  /**
   * 在工具中顯示的 slash command 名稱（如 `OPLG: Apply`）。
   */
  name: string;
  /**
   * 一句話描述。
   */
  description: string;
  /**
   * 分類（例：`Workflow`）。
   */
  category: string;
  /**
   * 標籤陣列。
   */
  tags: string[];
  /**
   * Slash command 的主體內容。
   */
  content: string;
}
