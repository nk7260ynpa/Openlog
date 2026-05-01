export const OPENLOG_DIR_NAME = 'openlog';

export interface AIToolOption {
  name: string;
  value: string;
  available: boolean;
  skillsDir: string;
}

export const AI_TOOLS: AIToolOption[] = [
  {
    name: 'Claude Code',
    value: 'claude',
    available: true,
    skillsDir: '.claude',
  },
  {
    name: 'GitHub Copilot',
    value: 'github-copilot',
    available: true,
    skillsDir: '.github',
  },
];

export function findToolByValue(value: string): AIToolOption | undefined {
  return AI_TOOLS.find((tool) => tool.value === value);
}
