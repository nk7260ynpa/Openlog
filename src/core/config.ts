export const OPENLOG_DIR_NAME = 'openlog';

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  /**
   * Root directory for the tool's configuration (e.g. `.claude`, `.github`).
   */
  skillsDir: string;
  /**
   * Whether the tool supports the Anthropic Agent Skills spec.
   *
   * - `true`: write a skill file at `<skillsDir>/skills/<dir>/SKILL.md`
   *   (Claude Code).
   * - `false`: skip the skill file and only write slash-command / prompt files
   *   (GitHub Copilot, etc.).
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
