export const OPENLOG_DIR_NAME = 'openlog';

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  /**
   * 工具設定的根目錄（如 `.claude`、`.github`）。
   */
  skillsDir: string;
  /**
   * 是否支援 Anthropic Agent Skills 規範。
   *
   * - `true`：在 `<skillsDir>/skills/<dir>/SKILL.md` 寫入 skill 檔（Claude Code）。
   * - `false`：跳過 skills 檔，只寫 slash command／prompt 檔（GitHub Copilot 等）。
   */
  supportsSkills: boolean;
}

export const AI_TOOLS: AIToolOption[] = [
  {
    name: 'Claude Code',
    value: 'claude',
    available: true,
    skillsDir: '.claude',
    supportsSkills: true,
  },
  {
    name: 'GitHub Copilot',
    value: 'github-copilot',
    available: true,
    skillsDir: '.github',
    supportsSkills: false,
  },
];

export function findToolByValue(value: string): AIToolOption | undefined {
  return AI_TOOLS.find((tool) => tool.value === value);
}
